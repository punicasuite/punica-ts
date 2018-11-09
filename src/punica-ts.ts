#!/usr/bin/env node --no-deprecation

// tslint:disable:no-console

import 'babel-polyfill';
import 'source-map-support/register';

import * as program from 'commander';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as process from 'process';
import { Assets } from './asset/assets';
import { Box } from './box/box';
import { Compiler } from './compile/compiler';
import { Deployer } from './deploy/deployer';
import { Invoker } from './invoke/invoker';
import { Tester } from './test/tester';
import { checkRequiredOption, getProjectDir, wrapDebug } from './utils/cliUtils';
import { CommandEx, patchCommander } from './utils/patchCommander';
import { version } from './utils/version';
import { WalletManager } from './wallet/walletManager';

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
  .option('--name <NAME>', 'specify which box to unbox')
  .action((options) => {
    const name: string = options.name;
    checkRequiredOption('name', name);

    return wrapDebug(program.debug, async () => {
      const box = new Box();
      return box.unbox(name, getProjectDir(program));
    });
  });

program
  .command('compile')
  .description('compile the specified contracts to avm and abi files')
  .option('--contracts [CONTRACTS]', 'specify contracts files in contracts dir')
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
  .option('--network [NETWORK]', 'specify which network the contracts will be deployed to')
  .option('--avm [AVM]', 'specify which avm file will be deployed')
  .option('--wallet [WALLET]', 'specify which wallet file will be used')
  .option('--config [CONFIG]', 'specify which deploy config file will be used')
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
  .option('--network [NETWORK]', 'specify which network the contracts will be invoked')
  .option('--wallet <WALLET>', 'specify which wallet file will be used')
  .option('--functions <FUNCTIONS>', 'specify which function will be executed')
  .option('--config <CONFIG>', 'specify which config file will be used')
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
  .option('--config <CONFIG>', 'specify which config file will be used')
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
  .description('Ontology smart contract IDE - SmartX (http://smartx.ont.io/)')
  .action(() => {
    console.log();
    console.log('Ontology smart contract IDE - SmartX.');
    console.log('Please go to Smartx for debugging smart contracts: http://smartx.ont.io/#/');
    console.log();
  });

program
  .command('node')
  .description('Ontology Blockchain private net in test mode')
  .action(() => {
    console.log();
    console.log('Ontology Blockchain private net in test mode.');
    console.log('Please download from: https://github.com/punicasuite/solo-chain/releases');
    console.log();
  });

program
  .command('scpm')
  .description('smart contract package manager，support download and publish')
  .action(() => true);

const testCmd = program.command('test') as CommandEx;
testCmd.description('test Smart contracts');
testCmd.forwardSubcommands();

testCmd
  .command('template')
  .description('generate test template file')
  .option('--abi <ABI>', 'specify which abi file to be used')
  .option('--config [CONFIG]', 'specify which config file will be used')
  .option('--wallet <WALLET>', 'specify which wallet file will be used')
  .action((options) => {
    const abi: string = options.abi;
    checkRequiredOption('abi', abi);

    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Generating template from abi file...');

      const tester = new Tester();
      tester.template(projectDir, options.config, abi, options.wallet, program.debug);

      console.log('Template ready.');
    });
  });

testCmd
  .command('exec')
  .description('execute the test file')
  .option('--file <FILE>', 'specify which test file to execute')
  .action((options) => {
    const file: string = options.file;
    checkRequiredOption('file', file);

    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Starting test...');

      const tester = new Tester();
      await tester.exec(__dirname, projectDir, file);

      console.log('Test complete');
    });
  });

const walletCmd = program.command('wallet') as CommandEx;
walletCmd.description('manage your ontid, account, asset');
walletCmd.forwardSubcommands();

const accountCmd = walletCmd.command('account') as CommandEx;
accountCmd.description('manage your account');
accountCmd.forwardSubcommands();

const assetCmd = walletCmd.command('asset') as CommandEx;
assetCmd.description('manager your asset, transfer, balance, withdraw ong, unbound ong');
assetCmd.forwardSubcommands();

accountCmd
  .command('add')
  .description('add account to wallet.json')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Creating account...');

      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, true);
      await manager.addAccount();

      console.log('Adding account successful.');
    });
  });

accountCmd
  .command('delete')
  .description('delete account by address.')
  .option('--address <ADDRESS>', 'specify address to delete')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const address: string = options.address;
    checkRequiredOption('address', address);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, false);
      await manager.deleteAccount(address);

      console.log('Deleting account successful.');
    });
  });

accountCmd
  .command('import')
  .description('import account by private key.')
  .option('--privateKey <PRIVATE_KEY>', 'specify private key to import in HEX format')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Importing account...');

      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, true);
      await manager.importAccount(options.privateKey);

      console.log('Importing account successful.');
    });
  });

accountCmd
  .command('list')
  .description('list all your account address.')
  .option('--wallet [WALLET]', 'specify which wallet file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet);
      const accounts = manager.listAccounts();

      console.log('Accounts:');
      accounts.forEach((account) => console.log(account));
    });
  });

const ontCmd = walletCmd.command('ontid') as CommandEx;
ontCmd.description('manage your identity');
ontCmd.forwardSubcommands();

ontCmd
  .command('add')
  .description('add identity to wallet.json')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      console.log('Creating identity...');

      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, true);
      await manager.addIdentity();

      console.log('Adding account successful.');
    });
  });

ontCmd
  .command('delete')
  .description('delete identity by ontid')
  .option('--ontid <ONTID>', 'specify ontid to delete')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const ontid: string = options.ontid;
    checkRequiredOption('ontid', ontid);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet, false);
      await manager.deleteIdentity(ontid);

      console.log('Deleting identity successful.');
    });
  });

ontCmd
  .command('list')
  .description('list all your identity ontids')
  .option('--wallet [WALLET]', 'specify which wallet file will be used')
  .action((options) => {
    const projectDir = getProjectDir(program);

    return wrapDebug(program.debug, async () => {
      const manager = new WalletManager();
      manager.init(projectDir, options.wallet);
      const identities = manager.listIdentities();

      console.log('Identities:');
      identities.forEach((identity) => console.log(identity));
    });
  });

assetCmd
  .command('transfer')
  .description('transfer your asset to another address')
  .option('--asset [ASSET]', 'asset of ONT or ONG (default: "ont")')
  .option('--sender <SENDER>', 'transfer-out account')
  .option('--to <TO>', 'transfer-in account')
  .option('--wallet [WALLET]', 'specify which wallet file will be used')
  .option('--amount <AMOUNT>', 'transfer amount')
  .option('--gas_price [GAS_PRICE]', 'gas price of transaction (default: 0)')
  .option('--gas_limit [GAS_LIMIT]', 'gas limit of the transaction (default: 20000)')
  .option('--network [NETWORK]', 'specify which network will be used (default testNet)')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const sender: string = options.sender;
    checkRequiredOption('sender', sender);

    const to: string = options.to;
    checkRequiredOption('to', to);

    const amount: string = options.amount;
    checkRequiredOption('amount', amount);

    return wrapDebug(program.debug, async () => {
      const assets = new Assets();

      await assets.transfer(
        projectDir,
        options.asset,
        sender,
        to,
        options.wallet,
        amount,
        options.gas_price,
        options.gas_limit,
        options.network
      );
    });
  });

assetCmd
  .command('withdrawOng')
  .description('withdraw unbound ong')
  .option('--claimer <CLAIMER>', 'transfer-out account')
  .option('--to <TO>', 'transfer-in account')
  .option('--wallet [WALLET]', 'specify which wallet file will be used')
  .option('--amount <AMOUNT>', 'transfer amount')
  .option('--gas_price [GAS_PRICE]', 'gas price of transaction (default: 0)')
  .option('--gas_limit [GAS_LIMIT]', 'gas limit of the transaction (default: 20000)')
  .option('--network [NETWORK]', 'specify which network will be used (default testNet)')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const claimer: string = options.claimer;
    checkRequiredOption('claimer', claimer);

    const to: string = options.to;
    checkRequiredOption('to', to);

    const amount: string = options.amount;
    checkRequiredOption('amount', amount);

    return wrapDebug(program.debug, async () => {
      const assets = new Assets();

      await assets.withdrawOng(
        projectDir,
        claimer,
        to,
        options.wallet,
        amount,
        options.gas_price,
        options.gas_limit,
        options.network
      );
    });
  });

assetCmd
  .command('balanceOf')
  .description('query balance of the address')
  .option('--asset [ASSET]', 'asset of ONT or ONG (default: "ont")')
  .option('--address <ADDRESS>', 'query balance of address')
  .option('--network [NETWORK]', 'specify which network will be used (default testNet)')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const address: string = options.address;
    checkRequiredOption('address', address);

    return wrapDebug(program.debug, async () => {
      const assets = new Assets();

      const balance = await assets.balanceOf(projectDir, options.asset, address, options.network);

      console.log(`${address} Balance: ${balance}`);
    });
  });

assetCmd
  .command('unboundOng')
  .description('query unbound ong')
  .option('--address [ADDRESS]', 'query unbound ong of address')
  .option('--network [NETWORK]', 'specify which network will be used (default testNet)')
  .action((options) => {
    const projectDir = getProjectDir(program);

    const address: string = options.address;
    checkRequiredOption('address', address);

    return wrapDebug(program.debug, async () => {
      const assets = new Assets();

      const balance = await assets.unboundOng(projectDir, options.address, options.network);

      console.log(`${address} UnboundOng: ${balance}`);
    });
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
