import * as fs from 'fs';
import * as path from 'path';
import { loadInvoke, loadPassword, loadWallet } from '../config/configLoader';
import { Abi, AbiFunction, InvokeConfig, ScFunction } from '../config/configTypes';
import { otherError } from '../exception/punicaException';
import { wrapDebug } from '../utils/cliUtils';
import { readAbi } from '../utils/fileSystem';
import { convertParamsStr } from '../utils/params';

// tslint:disable-next-line:no-var-requires
const jest = require('jest-cli');

// tslint:disable:no-console
// tslint:disable:quotemark
export class Tester {
  async exec(punicaLibDir: string, projectDir: string, fileName: string) {
    const punicaRootDir = punicaLibDir.substr(0, punicaLibDir.length - '/lib'.length);
    const root = path.join(projectDir, 'test');
    const file = path.join(root, fileName);

    const options = {
      roots: [root],
      config: punicaRootDir,
      testRegex: file
    };

    // console.log('projectDir:', projectDir);
    // console.log('roots:', options.roots);
    // console.log('cwd:', process.cwd());
    // console.log('dirname:', punicaRootDir);
    process.chdir(projectDir);
    await jest.runCLI(options, [root]);
  }
  template(
    projectDir: string,
    configKey: string | undefined,
    abiPath: string,
    walletFileName: string | undefined,
    debug: boolean
  ) {
    const templatePath = `${__dirname}/../../template/sc.test.ts`;

    const invokeConfig = loadInvoke(projectDir, configKey);
    const [, walletPath] = loadWallet(projectDir, walletFileName);

    const abiFullPath = path.join(projectDir, abiPath);
    const abiName = path.basename(abiFullPath);
    const abiDir = path.dirname(abiFullPath);
    const className = abiName.replace('_abi.json', '');

    const testDirPath = path.join(projectDir, 'test');
    const testFilePath = path.join(testDirPath, `${className}.test.ts`);

    const walletRelativePath = path.relative(projectDir, walletPath);

    const abi = readAbi(abiDir, abiName);

    const data = fs.readFileSync(templatePath, 'utf8');

    const defaultPayer = invokeConfig.defaultPayer;

    const tests = this.buildMethodTests(projectDir, configKey, defaultPayer, invokeConfig, abi, debug);

    const replaced = this.replacePlaceholders(data, abi.hash, walletRelativePath, tests);

    fs.writeFileSync(testFilePath, replaced, 'utf8');
  }

  private replacePlaceholders(data: string, contract: string, walletPath: string, tests: string[]) {
    const testsStr = tests.join('\n\n');

    data = data.replace('${contract}', contract);
    data = data.replace('${walletPath}', walletPath);
    data = data.replace('${tests}', testsStr);

    return data;
  }

  private buildMethodTests(
    projectDir: string,
    configKey: string | undefined,
    defaultPayer: string | undefined,
    invokeConfig: InvokeConfig,
    abi: Abi,
    debug: boolean
  ) {
    const invokeFunctions = new Map<string, ScFunction>();
    for (const func of invokeConfig.functions) {
      invokeFunctions.set(func.name, func);
    }

    const abiFunctions = new Map<string, AbiFunction>();
    for (const func of abi.functions) {
      abiFunctions.set(func.name, func);
    }

    const allExecFuncs = Array.from(invokeFunctions.keys());

    const tests: string[] = [];
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

        const invokeParams = invokeInfo.params !== undefined ? invokeInfo.params : [];

        console.log(`Generating test for ${functionName}...`);

        if (abiInfo.parameters.length !== Object.keys(invokeParams).length) {
          throw otherError(`Invoke failed, params mismatch between config and ABI file.`);
        }

        const parameters = convertParamsStr(invokeParams, abiInfo);
        const parametersStr = parameters.join(', ');

        if (invokeInfo.preExec) {
          const methodCall =
            `test('test ${functionName}', async () => {\n` +
            `   const response = await invoke({\n` +
            `     client,\n` +
            `     contract,\n` +
            `     preExec: true,\n` +
            `     method: '${abiInfo.name}',\n` +
            `     parameters: [${parametersStr}]\n` +
            `   });\n` +
            ` console.log(response);\n` +
            ` });\n`;

          tests.push(methodCall);
        } else {
          const payer: string | undefined = invokeInfo.payer !== undefined ? invokeInfo.payer : defaultPayer;

          if (payer === undefined) {
            throw otherError('Missing payer.');
          }

          let password = loadPassword(projectDir, configKey, payer);
          if (password === undefined) {
            password = '';
          }

          const methodCall =
            `  test('test ${functionName}', async () => {\n` +
            `    const response = await invoke({\n` +
            `      client,\n` +
            `      account: wallet.getAccount('${payer}'),\n` +
            `      password: '${password}',\n` +
            `      gasLimit,\n` +
            `      gasPrice,\n` +
            `      contract,\n` +
            `      method: '${abiInfo.name}',\n` +
            `      parameters: [${parametersStr}]\n` +
            `    });\n` +
            `    console.log(response);\n` +
            `  });\n`;

          tests.push(methodCall);
        }
      });
    }

    return tests;
  }
}
