import * as fs from 'fs';
import { Wallet } from 'ontology-ts-crypto';
import * as path from 'path';
import { DEFAULT_CONFIG } from '../consts';
import {
  configFileError,
  configFileNotFound,
  otherError,
  walletFileError,
  walletFileUnspecified
} from '../exception/punicaException';
import { Config } from './configTypes';

// tslint:disable:no-console

export function loadConfig(configFilePath: string) {
  try {
    const f = fs.readFileSync(configFilePath);
    return JSON.parse(f.toString()) as Config;
  } catch (e) {
    throw configFileNotFound();
  }
}

export function loadNetwork(configDirPath: string, networkKey?: string, debug?: boolean) {
  const configFilePath = path.join(configDirPath, 'punica-config.json');

  try {
    const config = loadConfig(configFilePath);

    try {
      if (networkKey === undefined) {
        networkKey = Object.keys(config.networks)[0];
      }
    } catch (e) {
      throw configFileError();
    }

    try {
      const network = config.networks[networkKey];
      const address = `${network.host}:${network.port}`;

      if (debug) {
        console.log(`Using network '${network}'.`);
      }

      return address;
    } catch (e) {
      throw configFileError();
    }
  } catch (e) {
    console.log('No punica-config.json config found. Using TEST-NET');
    return 'http://polaris1.ont.io:20336';
  }
}

export function loadDeploy(projectDir: string, configDir?: string) {
  let configPath: string;

  if (configDir !== undefined) {
    configPath = path.join(projectDir, configDir);
    if (fs.existsSync(configPath)) {
      if (!fs.statSync(configPath).isFile()) {
        throw otherError(`${configPath} is not a file`);
      }
    } else {
      configPath = path.join(projectDir, 'contracts', configDir);

      if (!fs.existsSync(configPath)) {
        throw otherError(`${configPath} does not exist`);
      }
    }
  } else {
    configPath = path.join(projectDir, 'contracts', DEFAULT_CONFIG);
  }

  if (!fs.existsSync(configPath)) {
    throw otherError(`${configPath} does not exist`);
  }

  const config = loadConfig(configPath);

  let deployInformation = config.deployInformation;
  if (deployInformation === undefined || typeof deployInformation !== 'object') {
    deployInformation = (config as any).deployConfig;

    if (deployInformation === undefined || typeof deployInformation !== 'object') {
      throw configFileError();
    }
  }

  return deployInformation;
}

export function loadWallet(projectDir: string, walletFileName?: string) {
  let walletPath: string;

  if (walletFileName === undefined) {
    const walletDirPath = path.join(projectDir, 'wallet');
    const dir = fs.readdirSync(walletDirPath);

    if (dir.length === 1) {
      walletPath = path.join(walletDirPath, dir[0]);
    } else {
      throw walletFileUnspecified();
    }
  } else {
    walletPath = path.join(projectDir, walletFileName);

    if (!fs.existsSync(walletPath)) {
      walletPath = path.join(projectDir, 'wallet', walletFileName);

      if (!fs.existsSync(walletPath)) {
        throw otherError(`${walletPath} does not exist`);
      }
    }
  }

  try {
    const f = fs.readFileSync(walletPath, 'utf8');
    return Wallet.deserializeJson(f);
  } catch (e) {
    throw walletFileError();
  }
}

export function loadAccount(wallet: Wallet, address?: string) {
  if (address === undefined) {
    address = wallet.defaultAccountAddress;
  }

  for (const account of wallet.accounts) {
    if (account.address.toBase58() === address) {
      return account;
    }
  }

  throw otherError('Payer account not found');
}
