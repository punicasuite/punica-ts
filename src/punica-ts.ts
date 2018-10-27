#!/usr/bin/env node --no-deprecation

// tslint:disable:no-console

import * as program from 'commander';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as process from 'process';
import { Box } from './box/box';
import { Compiler } from './compile/compiler';
import { Deployer } from './deploy/deployer';

git.plugins.set('fs', fs);

program
  .name('punica-ts')
  .description('Punica CLI - The Ontology Blockchain dApp development framework')
  .version('0.1.0', '-v, --version')
  .option('-p, --project [PATH]', 'Specify a punica project directory')
  .option('-d, --debug', 'Print exceptions');
program.parse(process.argv);

program
  .command('init')
  .description('initialize new and empty Ontology DApp project')
  .action(() => {
    return wrapDebug(async () => {
      const box = new Box();
      return box.init(getProjectDir());
    });
  });

program
  .command('unbox')
  .description('download a Punica Box, a pre-built Ontology DApp project.')
  .option('--box_name <BOX_NAME>', 'Specify which box to unbox')
  .action((options) => {
    const boxName: string = options.box_name;
    checkRequiredOption('box_name', boxName);

    return wrapDebug(async () => {
      const box = new Box();
      return box.unbox(boxName, getProjectDir());
    });
  });

program
  .command('compile')
  .description('compile the specified contracts to avm and abi files')
  .option('--contracts [CONTRACTS]', 'Specify contracts files in contracts dir')
  .action((options) => {
    const projectDir = getProjectDir();

    return wrapDebug(async () => {
      console.log('Compiling...');

      const compiler = new Compiler();
      await compiler.compile(projectDir, options.contracts);

      console.log('Compiled, Thank you.');
    });
  });

program
  .command('deploy')
  .description('deploy the specified contracts to specified chain')
  .option('--network [NETWORK]', 'Specify which network the contracts will be deployed')
  .option('--avm [AVM]', 'Specify which avm file will be deployed')
  .option('--wallet [WALLET]', 'Specify which wallet file will be used')
  .option('--config [CONFIG]', 'Specify which deploy config file will be used')
  .action((options) => {
    const projectDir = getProjectDir();

    return wrapDebug(async () => {
      console.log('Deploying...');

      const deployer = new Deployer();
      await deployer.deploy(projectDir, options.network, options.avm, options.wallet, options.config);
    });
  });

program
  .command('invoke')
  .description('invoke the function list in default-config or specify config.')
  .option('--network [NETWORK]', 'Specify which network the contracts will be invoked')
  .option('--avm <AVM>', 'Specify which avm file will be deployed')
  .option('--wallet <WALLET>', 'Specify which wallet file will be used')
  .option('--functions <FUNCTIONS>', 'Specify which function will be executed')
  .option('--config <CONFIG>', 'Specify which config file will be used')
  .action((options) => {
    console.log('invoking');
  });

program
  .command('smartx')
  .description('Ontology smart contract IDE,SmartX (http://smartx.ont.io/)')
  .action((options) => {
    console.log();
    console.log('Please go to Smartx for debugging smart contracts: \nhttp://smartx.ont.io/#/');
    console.log();
  });

program
  .command('node')
  .description('Ontology Blockchain private net in test mode')
  .action((options) => {
    console.log();
    console.log('Please download from: \nhttps://github.com/punicasuite/solo-chain/releases');
    console.log();
  });

program
  .command('wallet')
  .description('manage your ontid, account, asset.')
  .action((options) => {
    console.log('Unsupported');
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function getProjectDir() {
  let projectDir: string | undefined = program.project;

  if (projectDir === undefined) {
    projectDir = process.cwd();
  }

  return projectDir;
}

function checkRequiredOption(name: string, value: any) {
  if (value === undefined) {
    console.log(`Option --${name} is required.`);
    process.exit(1);
  }
}

function wrapDebug(func: () => Promise<void>) {
  return func().catch((reason) => {
    if (program.debug) {
      console.error(reason);
    } else {
      console.error(`Error: ${reason.message}.`);
      console.error('To see the stacktrace use option -d.');
    }
  });
}
