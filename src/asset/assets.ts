import BigNumber from 'bignumber.js';
import { Address } from 'ontology-ts-crypto';
import { initClient, RpcClient, transfer, withdrawOng } from 'ontology-ts-test';
import { loadAccount, loadNetwork, loadWallet } from '../config/configLoader';
import { otherError } from '../exception/punicaException';
import { inputExistingPassword } from '../wallet/walletCli';

export type Asset = 'ont' | 'ong';

// tslint:disable:no-console

export class Assets {
  async transfer(
    projectDir: string,
    asset: Asset = 'ont',
    sender: string,
    to: string,
    walletFileName: string | undefined,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    networkKey?: string
  ) {
    asset = asset.toLowerCase() as Asset;

    if (asset !== 'ont' && asset !== 'ong') {
      throw otherError('asset should be ont or ong');
    }

    const [wallet] = loadWallet(projectDir, walletFileName);

    const account = loadAccount(wallet, sender);
    const password = await inputExistingPassword('Please input sender account password: ');

    const rpcAddress = loadNetwork(projectDir, networkKey);
    const client = initClient({ rpcAddress });

    const response = await transfer({
      client,
      account,
      password,
      sender: account.address,
      to: Address.fromBase58(to),
      amount,
      asset,
      wait: false,
      gasLimit,
      gasPrice
    });

    const result = response.result;
    if (result !== '') {
      console.log(`Transaction: ${result}`);
    } else {
      console.warn(`Transfer failed. Error: ${result}.`);
    }
  }

  async withdrawOng(
    projectDir: string,
    claimer: string,
    to: string,
    walletFileName: string | undefined,
    amount: string,
    gasPrice: string,
    gasLimit: string,
    networkKey?: string
  ) {
    const [wallet] = loadWallet(projectDir, walletFileName);

    const account = loadAccount(wallet, claimer);
    const password = await inputExistingPassword('Please input claimer account password: ');

    const rpcAddress = loadNetwork(projectDir, networkKey);
    const client = initClient({ rpcAddress });

    const response = await withdrawOng({
      client,
      account,
      asset: 'ong',
      password,
      sender: account.address,
      to: Address.fromBase58(to),
      amount,
      wait: false,
      gasLimit,
      gasPrice
    });

    const result = response.result;
    if (result !== '') {
      console.log(`Transaction: ${result}`);
    } else {
      console.warn(`Withdraw ONG failed. Error: ${result}.`);
    }
  }

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
