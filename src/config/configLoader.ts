import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_CONFIG } from '../consts';
import { configFileError, configFileNotFound, otherError } from '../exception/punicaException';
import { Config } from './configTypes';

// tslint:disable:no-console

export function loadConfig(configDirPath: string) {
  try {
    const configFilePath = path.join(configDirPath, 'punica-config.json');
    const f = fs.readFileSync(configFilePath);
    return JSON.parse(f.toString()) as Config;
  } catch (e) {
    throw configFileNotFound();
  }
}

export function loadNetwork(configDirPath: string, networkKey?: string, debug?: boolean) {
  const config = loadConfig(configDirPath);

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

  const deployInformation = config.deployInformation;
  if (deployInformation === undefined || typeof deployInformation !== 'object') {
    throw configFileError();
  }

  return deployInformation;
}
