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
  payer: string; // ignored
  gasPrice: string | number;
  gasLimit: string | number;
}
