#!/usr/bin/env node --no-deprecation

// tslint:disable:no-console

import 'babel-polyfill';

import * as program from 'commander';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as process from 'process';
import { Box } from './box/box';
import { Compiler } from './compile/compiler';
import { Deployer } from './deploy/deployer';
import { checkRequiredOption, getProjectDir, wrapDebug } from './utils/cliUtils';
import { CommandEx, patchCommander } from './utils/patchCommander';
import { WalletManager } from './wallet/walletManager';

patchCommander(program);

git.plugins.set('fs', fs);

program
  .name('punica-ts')
  .description('Punica CLI - The Ontology Blockchain dApp development framework')
  .version('0.1.0', '-v, --version')
  .option('-p, --project [PATH]', 'specify a punica project directory')
  .option('-d, --debug', 'print exceptions');

program
  .command('init')
  .description('initialize new and empty Ontology DApp project')
  .action(() => {
    return wrapDebug(program, async () => {
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

    return wrapDebug(program, async () => {
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

    return wrapDebug(program, async () => {
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

    return wrapDebug(program, async () => {
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
    console.log('add account');
  });

accountCmd
  .command('delete')
  .description('Delete account by address.')
  .action(() => {
    console.log('del account');
  });

accountCmd
  .command('import')
  .description('Import account by private key.')
  .action(() => {
    console.log('import account');
  });

accountCmd
  .command('list')
  .description('List all your account address.')
  .option('--wallet [WALLET]', 'Specify which wallet file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program, async () => {
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
