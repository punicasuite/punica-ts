// import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { Account, PrivateKey, Wallet } from 'ontology-ts-crypto';
import * as path from 'path';
import * as uuid from 'uuid';
import { walletFileError } from '../exception/punicaException';
import { ensureDirExist } from '../utils/fileSystem';
import { inputNewPassword } from './walletCli';

// tslint:disable:object-literal-key-quotes
// tslint:disable:no-console

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

  async add() {
    console.log('Create account:');
    const password = await inputNewPassword();

    const account = Account.create(uuid(), PrivateKey.random(), password, this.wallet.scrypt);
    this.wallet.addAccount(account);
    this.saveWallet();
  }

  delete(address: string) {
    this.wallet.delAccount(address);
    this.saveWallet();
  }

  // async import(sk: string) {
  //   const password = await inputNewPassword();

  //   const privateKey = new PrivateKey(sk);
  //   const publicKey = privateKey.getPublicKey();
  //   const address = Address.fromPubKey(publicKey);

  //   const salt = randomBytes(16);

  //   const account: Account = {
  //     address: address.toBase58(),
  //     label: uuid(),
  //     lock: false,
  //     algorithm: 'ECDSA',
  //     parameters: { curve: 'P-256' },
  //     key: encryptWithGcm(sk, address, salt, password, this.wallet.scrypt),
  //     'enc-alg': 'aes-256-gcm',
  //     salt: salt.toString('base64'),
  //     isDefault: false,
  //     publicKey: publicKey.key.toString('hex'),
  //     signatureScheme: 'SHA256withECDSA'
  //   };

  //   this.wallet.accounts.push(account);
  // }

  list() {
    if (this.wallet.accounts !== undefined) {
      return this.wallet.accounts.map((a) => a.address.toBase58());
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
