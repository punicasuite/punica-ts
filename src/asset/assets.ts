import BigNumber from 'bignumber.js';
import { Address } from 'ontology-ts-crypto';
import { RpcClient } from 'ontology-ts-test';
import { loadNetwork } from '../config/configLoader';
import { otherError } from '../exception/punicaException';

export type Asset = 'ont' | 'ong';

export class Assets {
  async transfer(
    asset: Asset,
    sender: string,
    to: string,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    networkKey?: string
  ) {}

  async balanceOf(projectDir: string, asset: Asset = 'ong', address: string, networkKey?: string) {
    asset = asset.toLowerCase() as Asset;

    if (asset !== 'ont' && asset !== 'ong') {
      throw otherError('asset should be ont or ong');
    }

    const rpcAddress: string = loadNetwork(projectDir, networkKey);
    const client = new RpcClient(rpcAddress);

    const response = await client.getBalance(Address.fromBase58(address));

    if (response.error === 0 && response.result !== undefined) {
      if (asset === 'ong') {
        return new BigNumber(response.result.ong).shiftedBy(-9).toString();
      } else {
        return response.result.ont;
      }
    } else {
      throw otherError(response.desc);
    }
  }

  async withdrawOng(
    claimer: string,
    to: string,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    networkKey?: string
  ) {}

  async unboundOng(projectDir: string, address: string, networkKey?: string) {
    const rpcAddress: string = loadNetwork(projectDir, networkKey);
    const client = new RpcClient(rpcAddress);

    const response = await client.getUnboundOng(Address.fromBase58(address));

    if (response.error === 0 && response.result !== undefined) {
      return new BigNumber(response.result).shiftedBy(-9).toString();
    } else {
      throw otherError(response.desc);
    }
  }
}
