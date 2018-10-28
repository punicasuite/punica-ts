// import { randomBytes } from 'crypto';
import * as fs from 'fs';
import { Wallet } from 'ontology-ts-crypto';
import * as path from 'path';
// import * as uuid from 'uuid';
import { walletFileError } from '../exception/punicaException';
import { ensureDirExist } from '../utils/fileSystem';
// import { inputNewPassword } from './walletCli';

// tslint:disable:object-literal-key-quotes

export class WalletManager {
  wallet: Wallet;

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
    } catch (e) {
      throw walletFileError();
    }
  }

  private createWallet(walletPath: string) {
    try {
      this.wallet = Wallet.create();
      fs.writeFileSync(walletPath, 'utf8');
    } catch (e) {
      throw walletFileError();
    }
  }
}
