import * as fs from 'fs';
import { Address } from 'ontology-ts-crypto';
import { deploy, initClient, isDeployed, reverseBuffer } from 'ontology-ts-test';
import * as path from 'path';
import { loadAccount, loadDeploy, loadNetwork, loadPassword, loadWallet } from '../config/configLoader';
import { otherError } from '../exception/punicaException';
import { readAvm } from '../utils/fileSystem';
import { inputExistingPassword } from '../wallet/walletCli';

// tslint:disable:no-console

export class Deployer {
  async deploy(
    projectDir: string,
    networkKey?: string,
    avmFileName?: string,
    walletFileName?: string,
    configKey?: string
  ) {
    let avmDirPath: string;

    if (avmFileName !== undefined) {
      const avmPath = path.join(projectDir, avmFileName);

      if (fs.existsSync(avmPath)) {
        avmDirPath = path.dirname(avmPath);
        avmFileName = path.basename(avmPath);
      } else {
        avmDirPath = path.join(projectDir, 'contracts', 'build');
      }
    } else {
      avmDirPath = path.join(projectDir, 'contracts', 'build');
    }

    if (!fs.existsSync(avmDirPath)) {
      // tslint:disable-next-line:no-console
      throw otherError(`${avmDirPath} does not exist.`);
    }

    const rpcAddress: string = loadNetwork(projectDir, networkKey);
    const deployInfo = loadDeploy(projectDir, configKey);
    const [wallet] = loadWallet(projectDir, walletFileName);
    const account = loadAccount(wallet, deployInfo.payer);
    const configPassword = loadPassword(projectDir, configKey, account.address.toBase58());

    let avm: Buffer;
    [avm, avmFileName] = readAvm(avmDirPath, avmFileName);

    const client = initClient({ rpcAddress });

    console.log(`Running deployment: ${avmFileName}`);

    // test if contract is already deployed
    const contractAddress = this.generateContractAddress(avm);
    const deployed = await isDeployed({ client, scriptHash: contractAddress });

    if (deployed) {
      console.log(`Contract is already deployed at 0x${contractAddress}`);
      return;
    }

    let password: string;

    if (configPassword !== undefined) {
      password = configPassword;
    } else {
      password = await inputExistingPassword('Please input payer account password: ');
    }

    // try the password
    await account.decryptKey(password);

    await deploy({
      client,
      account,
      password,
      code: avm,
      gasLimit: String(deployInfo.gasLimit),
      gasPrice: String(deployInfo.gasPrice),
      name: deployInfo.name,
      version: deployInfo.version,
      author: deployInfo.author,
      email: deployInfo.email,
      description: deployInfo.desc,
      needStorage: deployInfo.needStorage
    });

    console.log(`Contract has been deployed to address 0x${contractAddress}.`);
  }

  generateContractAddress(avm: Buffer) {
    return reverseBuffer(Address.fromVmCode(avm).toArray()).toString('hex');
  }
}
