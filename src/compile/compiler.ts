import * as fs from 'fs';
import * as path from 'path';

// tslint:disable:no-console

export class Compiler {
  compile(projectDir: string, contracts?: string) {
    if (contracts !== undefined) {
      let contractFilePath = path.join(projectDir, contracts);

      if (!fs.existsSync(contractFilePath)) {
        contractFilePath = path.join(projectDir, 'contracts', contracts);
      }

      if (contracts.endsWith('.py') || contracts.endsWith('.cs')) {
        this.compileContract(path.dirname(contractFilePath), path.basename(contractFilePath), false, false);
      } else {
        // todo: change to exception
        console.log('Compile Error');
        console.log('file type is wrong');
        process.exit(0);
      }
    } else {
      const contractDir = path.join(projectDir, 'contracts');
      const contractNameList = fs.readdirSync(contractDir);

      for (const contractName of contractNameList) {
        if (contractName.startsWith('__') || contractName.endsWith('.json') || contractName === 'build') {
          continue;
        }
        const contractFilePath = path.join(contractDir, contractName);

        if (fs.statSync(contractFilePath).isDirectory()) {
          const contractNameListSub = fs.readdirSync(contractFilePath);

          for (const contractNameSub of contractNameListSub) {
            if (contractNameSub.startsWith('__') || contractNameSub.endsWith('.json')) {
              continue;
            }

            const contractFilePathSub = path.join(contractFilePath, contractNameSub);

            if (fs.statSync(contractFilePathSub).isDirectory()) {
              throw new Error('Nested too deep');
            } else if (fs.statSync(contractFilePathSub).isFile()) {
              if (contractFilePathSub.endsWith('.py') || contractFilePathSub.endsWith('.cs')) {
                this.compileContract(
                  path.dirname(contractFilePathSub),
                  path.basename(contractFilePathSub),
                  false,
                  false
                );
              }
            } else {
              // todo: change to exception
              console.log('Compile Error');
              console.log('file type is wrong');
              process.exit(0);
            }
          }
        } else if (fs.statSync(contractFilePath).isFile()) {
          if (contractFilePath.endsWith('.py') || contractFilePath.endsWith('.cs')) {
            this.compileContract(path.dirname(contractFilePath), path.basename(contractFilePath), false, false);
          } else {
            // todo: change to exception
            console.log('Compile Error');
            console.log('file type is wrong');
            process.exit(0);
          }
        } else {
          throw new Error('contract path is wrong');
        }
      }
    }
  }

  compileContract(contractDir: string, contractName: string, avm: boolean, abi: boolean) {}
}
