export interface Config {
  networks: Networks;
  deployInformation: DeployInformation;
}

export interface Networks {
  [key: string]: Network;
}

export interface Network {
  host: string;
  port: number;
}

export interface DeployInformation {
  name: string;
  version: string;
  author: string;
  email: string;
  desc: string;
  needStorage: boolean;
  payer: string;
  gasPrice: string | number;
  gasLimit: string | number;
}

export interface Wallet {
  name: string;
  version: string;
  createTime: string;
  defaultOntId: string;
  defaultAccountAddress: string;
  scrypt: SCrypt;
  accounts: Account[];
}

export interface SCrypt {
  n: number;
  r: number;
  p: number;
  dkLen: number;
}

export interface Account {
  address: string;
  algorithm: string;
  'enc-alg': string;

  isDefault: string;

  key: string;
  label: string;
  lock: boolean;
  parameters: Parameters;
  salt: string;
  publicKey: string;
  signatnatureScheme: string;
}

export interface Parameters {
  curve: string;
}
