import * as fs from 'fs';
import { Account, Identity, PrivateKey, Wallet } from 'ontology-ts-crypto';
import * as path from 'path';
import * as uuid from 'uuid';
import { otherError, walletFileError } from '../exception/punicaException';
import { ensureDirExist } from '../utils/fileSystem';
import { inputExistingPassword, inputNewPassword } from './walletCli';

export class WalletManager {
  wallet: Wallet;
  walletPath: string;

  init(projectDir: string, walletFileName?: string, create?: boolean) {
    if (walletFileName === undefined) {
      walletFileName = path.join('wallet', 'wallet.json');
    }

    const walletPath = path.join(projectDir, walletFileName);
    const walletPathDir = path.dirname(walletPath);

    if (create && !fs.existsSync(walletPathDir)) {
      ensureDirExist(walletPathDir);
    }

    if (fs.existsSync(walletPath)) {
      this.loadWallet(walletPath);
    } else {
      this.createWallet(walletPath);
    }
  }

  async addAccount() {
    const password = await inputNewPassword();

    const account = Account.create(uuid(), PrivateKey.random(), password, this.wallet.scrypt);
    this.wallet.addAccount(account);
    this.saveWallet();
  }

  async deleteAccount(address: string) {
    const password = await inputExistingPassword();

    const account = this.wallet.getAccount(address);
    if (account === undefined) {
      throw otherError(`Account with address ${address} does not exist.`);
    }

    // try to decrypt
    await account.decryptKey(password);

    this.wallet.delAccount(address);
    this.saveWallet();
  }

  async importAccount(sk: string) {
    const password = await inputNewPassword();

    const account = Account.import(uuid(), new PrivateKey(sk), password, undefined, this.wallet.scrypt);
    this.wallet.addAccount(account);
    this.saveWallet();
  }
  listAccounts() {
    if (this.wallet.accounts !== undefined) {
      return this.wallet.accounts.map((a) => a.address.toBase58());
    } else {
      return [];
    }
  }

  async addIdentity() {
    const password = await inputNewPassword();

    const identity = Identity.create(uuid(), PrivateKey.random(), password, this.wallet.scrypt);
    this.wallet.addIdentity(identity);
    this.saveWallet();
  }

  async deleteIdentity(ontid: string) {
    const password = await inputExistingPassword();

    const identity = this.wallet.getIdentity(ontid);
    if (identity === undefined) {
      throw otherError(`Identity with ontid ${ontid} does not exist.`);
    }

    // try to decrypt
    await identity.decryptKey('1', password);

    this.wallet.delIdentity(ontid);
    this.saveWallet();
  }

  listIdentities() {
    if (this.wallet.identities !== undefined) {
      return this.wallet.identities.map((a) => a.ontid);
    } else {
      return [];
    }
  }

  private loadWallet(walletPath: string) {
    try {
      const f = fs.readFileSync(walletPath, 'utf8');
      this.wallet = Wallet.deserializeJson(f);
      this.walletPath = walletPath;
    } catch (e) {
      throw walletFileError();
    }
  }

  private saveWallet() {
    try {
      const data = this.wallet.serializeJson(true);
      fs.writeFileSync(this.walletPath, data, 'utf8');
    } catch (e) {
      throw walletFileError();
    }
  }

  private createWallet(walletPath: string) {
    try {
      this.wallet = Wallet.create();
      fs.writeFileSync(walletPath, 'utf8');
      this.walletPath = walletPath;
    } catch (e) {
      throw walletFileError();
    }
  }
}
