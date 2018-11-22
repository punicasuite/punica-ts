export interface Config {
  networks: Networks;
  defaultNet?: string;
  deployInformation: DeployInformation;
  invokeConfig: InvokeConfig;
  password?: Passwords;
}

export interface Passwords {
  [key: string]: string;
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

export interface InvokeConfig {
  abi: string;
  defaultPayer?: string;
  defaultSigner: string;
  gasPrice: string | number;
  gasLimit: string | number;
  functions: ScFunction[];
}

export interface ScFunction {
  operation: string;
  args: Param[];
  signature?: Signature;
  payer: string | undefined;
  preExec: boolean;
}

export interface Param {
  name: string;
  value: any;
}

export interface Signature {
  m?: number;
  signers?: string[];
}

export interface Abi {
  hash: string;
  entrypoint: string;
  events: any[];
  functions: AbiFunction[];
}

export interface AbiFunction {
  name: string;
  parameters: AbiParamter[];
  returntype: AbiType;
}

export interface AbiParamter {
  name: string;
  type: AbiType;
}

export type AbiType = 'String' | 'Integer' | 'Array' | 'Boolean' | 'ByteArray' | 'Struct';
