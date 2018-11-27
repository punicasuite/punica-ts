import { initClient, invoke, isDeployed, Signer } from 'ontology-ts-test';
import * as path from 'path';
import { loadAccount, loadInvoke, loadNetwork, loadPassword, loadWallet } from '../config/configLoader';
import { AbiFunction, ScFunction } from '../config/configTypes';
import { abiFileError, configFileError, otherError } from '../exception/punicaException';
import { questionAsync } from '../utils/async';
import { wrapDebug } from '../utils/cliUtils';
import { readAbi } from '../utils/fileSystem';
import { convertParams } from '../utils/params';

// tslint:disable:no-console

export class Invoker {
  list(projectDir: string, configKey?: string) {
    const invokeConfig = loadInvoke(projectDir, configKey);
    return invokeConfig.functions.map((func) => func.operation);
  }
  async invoke(
    projectDir: string,
    execFuncStr?: string,
    networkKey?: string,
    walletFileName?: string,
    configKey?: string,
    debug?: boolean
  ) {
    const rpcAddress = loadNetwork(projectDir, networkKey);
    const invokeConfig = loadInvoke(projectDir, configKey);
    const [wallet] = loadWallet(projectDir, walletFileName);

    const client = initClient({ rpcAddress });

    const abiFileName = invokeConfig.abi;
    if (abiFileName === undefined) {
      throw configFileError();
    }

    console.log(`Running invocation: ${abiFileName}`);

    const defaultPayer = invokeConfig.defaultPayer;
    let defaultPassword: string | undefined;

    if (defaultPayer !== undefined) {
      console.log('Unlock default payer account...');
      const configPassword = loadPassword(projectDir, configKey, defaultPayer);

      if (configPassword !== undefined) {
        defaultPassword = configPassword;
      } else {
        defaultPassword = await questionAsync('Please input payer account password: ');
      }
    }

    const abiDirPath = path.join(projectDir, 'contracts', 'build');
    const abi = readAbi(abiDirPath, abiFileName);

    if (abi.hash === undefined) {
      throw abiFileError();
    }

    const contractAddress = abi.hash;
    const deployed = await isDeployed({ client, scriptHash: contractAddress });

    if (!deployed) {
      console.log(`Contract ${contractAddress} hash't been deployed to current network ${networkKey}`);
      return;
    }

    const invokeFunctions = new Map<string, ScFunction>();
    for (const func of invokeConfig.functions) {
      invokeFunctions.set(func.operation, func);
    }

    const abiFunctions = new Map<string, AbiFunction>();
    for (const func of abi.functions) {
      abiFunctions.set(func.name, func);
    }

    let allExecFuncs: string[];
    if (execFuncStr !== undefined) {
      allExecFuncs = execFuncStr.split(',');
    } else {
      allExecFuncs = Array.from(invokeFunctions.keys());
    }

    const sleepTime = invokeConfig.sleepTime !== undefined ? invokeConfig.sleepTime * 1000 : 6000;

    for (const functionName of allExecFuncs) {
      wrapDebug(debug, async () => {
        const invokeInfo = invokeFunctions.get(functionName);

        if (invokeInfo === undefined) {
          throw otherError(`There is no function with name ${functionName} in the config.`);
        }

        const abiInfo = abiFunctions.get(functionName);
        if (abiInfo === undefined) {
          throw otherError(`There is no function with name ${functionName} in the ABI file.`);
        }

        const invokeParams = invokeInfo.args !== undefined ? invokeInfo.args : [];

        console.log(`Invoking ${functionName}...`);

        if (abiInfo.parameters.length !== Object.keys(invokeParams).length) {
          throw otherError(`Invoke failed, params mismatch between config and ABI file.`);
        }

        const parameters = convertParams(invokeParams, abiInfo);

        if (invokeInfo.preExec) {
          const response = await invoke({
            client,
            contract: contractAddress,
            method: abiInfo.name,
            parameters,
            gasLimit: String(invokeConfig.gasLimit),
            gasPrice: String(invokeConfig.gasPrice),
            preExec: true,
            debug
          });

          const result = response.result;
          if (result !== undefined) {
            const inner = result.Result;

            if (inner !== undefined) {
              console.log('Invocation was successful. Result:', inner);
              return;
            }
          }

          console.warn('Invocation failed.');
        } else {
          const payer: string | undefined = invokeInfo.payer !== undefined ? invokeInfo.payer : defaultPayer;

          if (payer === undefined) {
            throw otherError('Missing payer.');
          }

          const account = loadAccount(wallet, payer);

          let password: string;
          if (payer === defaultPayer && defaultPassword !== undefined) {
            password = defaultPassword;
          } else {
            const configMethodPassword = loadPassword(projectDir, configKey, payer);

            if (configMethodPassword !== undefined) {
              password = configMethodPassword;
            } else {
              password = await questionAsync('Please input payer account password: ');
            }
          }

          // add additional signatures
          let signers: Signer[] | undefined;
          const signature = invokeInfo.signature;
          if (signature !== undefined && signature.m !== undefined && signature.signers !== undefined) {
            signers = [];

            for (const signer of signature.signers) {
              const signerAccount = loadAccount(wallet, signer);
              let signerPassword = loadPassword(projectDir, configKey, signer);

              if (signerPassword === undefined) {
                signerPassword = await questionAsync(`Please input password for account ${signer} : `);
              }

              signers.push({ account: signerAccount, password: signerPassword });
            }
          }

          const response = await invoke({
            client,
            account,
            password,
            signers,
            contract: contractAddress,
            method: abiInfo.name,
            parameters,
            wait: false,
            gasLimit: String(invokeConfig.gasLimit),
            gasPrice: String(invokeConfig.gasPrice)
          });

          await sleep(sleepTime);

          const result = response.result;
          if (result !== '') {
            console.log(`Invocation was successful. Transaction: ${result}.`);
          } else {
            console.warn(`Invocation failed. Error: ${result}.`);
          }
        }
      });
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
