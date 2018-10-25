import * as fs from 'fs';
import { compile, CompilerType, loadContract } from 'ontology-ts-test';
import * as path from 'path';
import { ensureDirExist } from '../utils/fileSystem';

export class Compiler {
  async compile(projectDir: string, contracts?: string) {
    let contractsPath: string;

    if (contracts !== undefined) {
      contractsPath = path.join(projectDir, contracts);

      if (!fs.existsSync(contractsPath)) {
        contractsPath = path.join(projectDir, 'contracts', contracts);
      }
    } else {
      contractsPath = path.join(projectDir, 'contracts');
    }

    return this.compileInternal(contractsPath);
  }

  async compileInternal(fileOrDir: string) {
    const stats = fs.statSync(fileOrDir);

    if (stats.isDirectory()) {
      const children = fs.readdirSync(fileOrDir);

      for (const child of children) {
        if (child.startsWith('__') || child.endsWith('.json') || child === 'build') {
          continue;
        }

        const childPath = path.join(fileOrDir, child);
        await this.compileInternal(childPath);
      }
    } else if (stats.isFile()) {
      if (fileOrDir.endsWith('.py') || fileOrDir.endsWith('.cs')) {
        await this.compileContract(path.dirname(fileOrDir), path.basename(fileOrDir));
      } else {
        throw Error('Compile Error: file type is wrong');
      }
    } else {
      throw new Error('Compile Error: contract path is wrong');
    }
  }

  async compileContract(dir: string, name: string, abiSavePath?: string, avmSavePath?: string) {
    const contractPath = path.join(dir, name);

    const code = loadContract(contractPath);

    let type: CompilerType;
    let url: string;

    if (contractPath.endsWith('.py')) {
      type = 'Python';
      url = 'https://smartxcompiler.ont.io/api/beta/python/compile';
    } else if (contractPath.endsWith('.cs')) {
      type = 'CSharp';
      url = 'https://smartxcompiler.ont.io/api/v1.0/csharp/compile';
    } else {
      throw new Error('Compile Error: contract type is unknown');
    }

    if (abiSavePath === undefined) {
      const splitPath = path.parse(contractPath);
      const savePath = path.join(path.dirname(splitPath.dir), 'build', splitPath.base);
      if (savePath.endsWith('.py')) {
        abiSavePath = savePath.replace('.py', '_abi.json');
      } else {
        abiSavePath = savePath.replace('.cs', '_abi.json');
      }
    }

    if (avmSavePath === undefined) {
      const splitPath = path.parse(contractPath);
      const savePath = path.join(path.dirname(splitPath.dir), 'build', splitPath.base);
      if (savePath.endsWith('.py')) {
        avmSavePath = savePath.replace('.py', '.avm');
      } else {
        avmSavePath = savePath.replace('.cs', '.avm');
      }
    }

    // disable SSL verify because of misconfigured compiler server
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const result = await compile({ code, type, url });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    ensureDirExist(path.parse(avmSavePath).dir);
    ensureDirExist(path.parse(abiSavePath).dir);

    fs.writeFileSync('./' + avmSavePath, result.avm.toString('hex'));
    fs.writeFileSync('./' + abiSavePath, result.abi);
  }
}
