import { initClient, invoke, isDeployed } from 'ontology-ts-test';
import * as path from 'path';
import { isArray } from 'util';
import { loadAccount, loadInvoke, loadNetwork, loadWallet } from '../config/configLoader';
import { AbiFunction, Params, ScFunction } from '../config/configTypes';
import { abiFileError, configFileError, otherError } from '../exception/punicaException';
import { questionAsync } from '../utils/async';
import { readAbi } from '../utils/fileSystem';

// tslint:disable:no-console

export class Invoker {
  async invoke(
    projectDir: string,
    execFuncStr?: string,
    networkKey?: string,
    walletFileName?: string,
    configKey?: string
  ) {
    const rpcAddress = loadNetwork(projectDir, networkKey);
    const invokeConfig = loadInvoke(projectDir, configKey);
    const wallet = loadWallet(projectDir, walletFileName);

    const client = initClient({ rpcAddress });

    const abiFileName = invokeConfig.abi;
    if (abiFileName === undefined) {
      throw configFileError();
    }

    const defaultPayer = invokeConfig.defaultPayer;
    if (defaultPayer === undefined) {
      throw otherError('defaultPayer is undefined');
    }

    console.log(`Running invocation: ${abiFileName}`);

    console.log('Unlock default payer account...');
    const defaultPassword = await questionAsync('Please input payer account password: ');

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
      invokeFunctions.set(func.name, func);
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

    for (const functionName of allExecFuncs) {
      const invokeInfo = invokeFunctions.get(functionName);

      if (invokeInfo === undefined) {
        console.warn(`There is no function with name ${functionName} in the config.`);
        continue;
      }

      const abiInfo = abiFunctions.get(functionName);
      if (abiInfo === undefined) {
        console.warn(`There is no function with name ${functionName} in the ABI file.`);
        continue;
      }

      const invokeParams = invokeInfo.params !== undefined ? invokeInfo.params : [];

      console.log(`Invoking ${functionName}...`);

      if (abiInfo.parameters.length !== Object.keys(invokeParams).length) {
        console.warn(`Invoke failed, params mismatch between config and ABI file.`);
        continue;
      }

      const parameters = this.convertParams(invokeParams, abiInfo);

      if (invokeInfo.preExec) {
        const response = await invoke({
          client,
          contract: contractAddress,
          method: abiInfo.name,
          parameters,
          gasLimit: String(invokeConfig.gasLimit),
          gasPrice: String(invokeConfig.gasPrice),
          preExec: true
        });

        const result = response.result;
        if (result !== undefined) {
          const inner = result.Result;

          if (inner !== undefined) {
            console.log('Invocation was successful. Result:', inner);
            continue;
          }
        }

        console.warn('Invocation failed.');
      } else {
        const payer: string = invokeInfo.payer !== undefined ? invokeInfo.payer : defaultPayer;

        const account = loadAccount(wallet, payer);

        let password: string;
        if (payer !== defaultPayer) {
          password = await questionAsync('Please input payer account password: ');
        } else {
          password = defaultPassword;
        }

        // fixme: signers are not supported yet

        const response = await invoke({
          client,
          account,
          password,
          contract: contractAddress,
          method: abiInfo.name,
          parameters,
          wait: false,
          gasLimit: String(invokeConfig.gasLimit),
          gasPrice: String(invokeConfig.gasPrice)
        });

        const result = response.result;
        if (result !== '') {
          console.log(`Invocation was successful. Transaction: ${result}.`);
        } else {
          console.warn(`Invocation failed. Error: ${result}.`);
        }
      }
    }
  }

  convertParam(param: any): any {
    if (typeof param === 'boolean') {
      return param;
    } else if (typeof param === 'number') {
      return param;
    } else if (typeof param === 'string') {
      if (param.startsWith('ByteArray:')) {
        return new Buffer(param.substr('ByteArray:'.length));
      } else {
        // string parameters are more likely hex encoded
        return new Buffer(param, 'hex');
      }
    } else if (isArray(param)) {
      return param.map((child) => this.convertParam(child));
    } else {
      throw new Error('Unsupported param type');
    }
  }

  convertParams(invokeParams: Params, abiInfo: AbiFunction) {
    return abiInfo.parameters.map((abiParameter) => {
      const invokeParameter = invokeParams[abiParameter.name];
      if (invokeParameter === undefined) {
        throw new Error('Missing parameter value.');
      }

      return this.convertParam(invokeParameter);
    });
  }
}
