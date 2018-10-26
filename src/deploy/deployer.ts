import * as fs from 'fs';
import { Address, deploy, initClient, reverseBuffer } from 'ontology-ts-test';
import * as path from 'path';
import { readAvm } from '../utils/fileSystem';
import { loadNetwork, loadDeploy } from '../config/configLoader';

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
      console.warn(avmDirPath, 'not exist');
    }

    const rpcAddress: string = loadNetwork(projectDir, networkKey);
    const account = loadAccount(walletFileName);
    const deployInfo = loadDeploy(projectDir, configKey);

    let avm: Buffer;
    [avm, avmFileName] = readAvm(avmDirPath, avmFileName);

    const client = initClient({ rpcAddress });

    try {
      console.log(`Running deployment: ${avmFileName}`);
      console.log('Deploying...');

      await deploy({
        client,
        account,
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
    } catch (e) {
      console.log('Deploy failed...');
      console.log('Contract has been deployed...');
      console.log(`Contract address is 0x${this.generateContractAddress(avm)}...`);
    }
  }

  generateContractAddress(avm: Buffer) {
    return reverseBuffer(Address.parseFromVmCode(avm).toArray()).toString('hex');
  }
}
