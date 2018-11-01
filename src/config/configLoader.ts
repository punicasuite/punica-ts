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

export function loadConfigFile(configFilePath: string) {
  try {
    const f = fs.readFileSync(configFilePath);
    return JSON.parse(f.toString()) as Config;
  } catch (e) {
    throw configFileNotFound();
  }
}

export function loadNetwork(configDirPath: string, networkKey?: string, debug?: boolean) {
  const configFilePath = path.join(configDirPath, 'punica-config.json');

  const config = loadConfigFile(configFilePath);

  try {
    if (networkKey === undefined) {
      if (config.defaultNet !== undefined) {
        networkKey = config.defaultNet;
      } else {
        throw otherError('No network specified');
      }
    }
  } catch (e) {
    throw configFileError();
  }

  try {
    const network = config.networks[networkKey];
    const address = `${network.host}:${network.port}`;

    if (network === undefined) {
      throw otherError(`There is no network called ${networkKey} in config file.`);
    }

    console.log(`Using network '${networkKey}'.`);

    return address;
  } catch (e) {
    throw configFileError();
  }
}

export function loadConfig(projectDir: string, configDir?: string) {
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

  return loadConfigFile(configPath);
}

export function loadDeploy(projectDir: string, configDir?: string) {
  const config = loadConfig(projectDir, configDir);

  let deployInformation = config.deployInformation;
  if (deployInformation === undefined || typeof deployInformation !== 'object') {
    deployInformation = (config as any).deployConfig;

    if (deployInformation === undefined || typeof deployInformation !== 'object') {
      throw configFileError();
    }
  }

  return deployInformation;
}

export function loadPassword(projectDir: string, configDir: string | undefined, address: string) {
  const config = loadConfig(projectDir, configDir);

  const passwords = config.password;

  if (passwords !== undefined && typeof passwords === 'object') {
    return passwords[address];
  }

  return undefined;
}

export function loadInvoke(projectDir: string, configDir?: string) {
  const config = loadConfig(projectDir, configDir);

  const invokeConfig = config.invokeConfig;
  if (invokeConfig === undefined || typeof invokeConfig !== 'object') {
    throw configFileError();
  }

  return invokeConfig;
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
