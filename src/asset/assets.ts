import { loadNetwork } from '../config/configLoader';
import { otherError } from '../exception/punicaException';
import { RpcClient } from 'ontology-ts-test';
import { Address } from 'ontology-ts-crypto';

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
    if (asset !== 'ont' && asset !== 'ong') {
      throw otherError('asset should be ont or ong');
    }

    const rpcAddress: string = loadNetwork(projectDir, networkKey);
    const client = new RpcClient(rpcAddress);

    const response = await client.getBalance(Address.fromBase58(address));

    // if ()
  }

  async withdrawOng(
    claimer: string,
    to: string,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    networkKey?: string
  ) {}

  async unboundOng(address: string, networkKey?: string) {}
}
