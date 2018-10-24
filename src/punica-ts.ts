#!/usr/bin/env node

// tslint:disable:no-console

import 'babel-polyfill';
import * as program from 'commander';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as process from 'process';
import { Box } from './box/box';

git.plugins.set('fs', fs);

program
  .name('punica-ts')
  .description('Punica CLI')
  .version('0.1.0', '-v, --version')
  .option('-p, --project [PATH]', 'Specify a punica project directory');
program.parse(process.argv);

program
  .command('init')
  .description('Initialize new and empty Ontology DApp project')
  .action(() => {
    const box = new Box();
    return box.init(getProjectDir());
  });

program
  .command('unbox')
  .description('Download a Punica Box, a pre-built Ontology DApp project.')
  .option('--box_name <BOX_NAME>', 'Specify which box to unbox')
  .action((options) => {
    const boxName: string = options.box_name;
    checkRequiredOption('box_name', boxName);

    const box = new Box();
    return box.unbox(boxName, getProjectDir());
  });

program
  .command('compile')
  .description('Compile specified contracts files in contracts dir')
  .action(() => {
    const projectDir = getProjectDir();

    try {
      console.log('Compile');
    } catch (e) {}
  });

program
  .command('deploy')
  .description('Deploy the specified contracts to specified chain')
  .option('--avm <AVM>', 'Specify which avm file will be deployed')
  .option('--wallet <WALLET>', 'Specify which wallet file will be used')
  .option('--config <CONFIG>', 'Specify which deploy config file will be used')
  .action((options) => {
    console.log('deploying');
  });

program
  .command('invoke')
  .description('Invoke the function list in default-config or specify config.')
  .option('--network <NETWORK>', 'Specify which network the contracts will be deployed')
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
