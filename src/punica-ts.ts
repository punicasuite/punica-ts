#!/usr/bin/env node --no-deprecation

// tslint:disable:no-console

import 'babel-polyfill';
import 'source-map-support/register';

import * as program from 'commander';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as process from 'process';
import { Box } from './box/box';
import { Compiler } from './compile/compiler';
import { Deployer } from './deploy/deployer';
import { Invoker } from './invoke/invoker';
import { checkRequiredOption, getProjectDir, wrapDebug } from './utils/cliUtils';
import { CommandEx, patchCommander } from './utils/patchCommander';
import { version } from './utils/version';
import { WalletManager } from './wallet/walletManager';

import { scryptSync } from 'crypto';

console.log('scrypt:', scryptSync);

patchCommander(program);

git.plugins.set('fs', fs);

program
  .name('punica-ts')
  .description('Punica CLI - The Ontology Blockchain dApp development framework')
  .version(version, '-v, --version')
  .option('-p, --project [PATH]', 'specify a punica project directory')
  .option('-d, --debug', 'print exceptions');

program
  .command('init')
  .description('initialize new and empty Ontology DApp project')
  .action(() => {
    return wrapDebug(program.debug, async () => {
      const box = new Box();
      return box.init(getProjectDir(program));
    });
  });

program
  .command('unbox')
  .description('download a Punica Box, a pre-built Ontology DApp project.')
  .option('--box_name <BOX_NAME>', 'Specify which box to unbox')
  .action((options) => {
    const boxName: string = options.box_name;
    checkRequiredOption('box_name', boxName);

    return wrapDebug(program.debug, async () => {
      const box = new Box();
      return box.unbox(boxName, getProjectDir(program));
    });
  });

program
  .command('compile')
  .description('compile the specified contracts to avm and abi files')
  .option('--contracts [CONTRACTS]', 'Specify contracts files in contracts dir')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Compiling...');

      const compiler = new Compiler();
      await compiler.compile(projectDir, options.contracts);

      console.log('Compiled, Thank you.');
    });
  });

program
  .command('deploy')
  .description('deploy the specified contracts to specified chain')
  .option('--network [NETWORK]', 'Specify which network the contracts will be deployed to')
  .option('--avm [AVM]', 'Specify which avm file will be deployed')
  .option('--wallet [WALLET]', 'Specify which wallet file will be used')
  .option('--config [CONFIG]', 'Specify which deploy config file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Deploying...');

      const deployer = new Deployer();
      await deployer.deploy(projectDir, options.network, options.avm, options.wallet, options.config);
    });
  });

program
  .command('invoke')
  .description('invoke the function list in default-config or specify config.')
  .option('--network [NETWORK]', 'Specify which network the contracts will be invoked')
  .option('--wallet <WALLET>', 'Specify which wallet file will be used')
  .option('--functions <FUNCTIONS>', 'Specify which function will be executed')
  .option('--config <CONFIG>', 'Specify which config file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Invoking...');

      const invoker = new Invoker();
      await invoker.invoke(
        projectDir,
        options.functions,
        options.network,
        options.wallet,
        options.config,
        program.debug
      );
    });
  });

program
  .command('list')
  .description('list all the function in default-config or specified config.')
  .option('--config <CONFIG>', 'Specify which config file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      const invoker = new Invoker();
      const functions = await invoker.list(projectDir, options.config);

      console.log('Functions:');
      functions.forEach((func) => console.log(func));
    });
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

const walletCmd = program.command('wallet') as CommandEx;
walletCmd.description('manage your ontid, account, asset.');
walletCmd.forwardSubcommands();

const accountCmd = walletCmd.command('account') as CommandEx;
accountCmd.description('manage your account');
accountCmd.forwardSubcommands();

accountCmd
  .command('add')
  .description('add account to wallet.json')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Creating account...');

      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, true);
      await manager.add();

      console.log('Adding account successful.');
    });
  });

accountCmd
  .command('delete')
  .description('Delete account by address.')
  .option('--address <ADDRESS>', 'Specify address to delete')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, false);
      manager.delete(options.address);

      console.log('Deleting account successful.');
    });
  });

accountCmd
  .command('import')
  .description('Import account by private key.')
  .option('--privateKey <PRIVATE_KEY>', 'Specify private key to import in HEX format')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Importing account...');

      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, true);
      await manager.import(options.privateKey);

      console.log('Importing account successful.');
    });
  });

accountCmd
  .command('list')
  .description('List all your account address.')
  .option('--wallet [WALLET]', 'Specify which wallet file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet);
      const accounts = manager.list();

      console.log('Accounts:');
      accounts.forEach((account) => console.log(account));
    });
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
