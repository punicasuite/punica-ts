import * as bigInt from 'big-integer';
import { Account, Address, PrivateKey, Serialize } from 'ontology-ts-crypto';
import { reverseBuffer } from 'ontology-ts-test';

// tslint:disable:object-literal-key-quotes

export class Tooler {
  addressToHex(address: string) {
    return Address.fromBase58(address)
      .toArray()
      .toString('hex');
  }

  str2hex(str: string) {
    return new Buffer(str).toString('hex');
  }

  hexReverse(hex: string) {
    return reverseBuffer(new Buffer(hex, 'hex')).toString('hex');
  }

  num2hex(num: string) {
    return Serialize.bigIntToBytes(bigInt(num)).toString('hex');
  }

  randomPrivateKey() {
    return PrivateKey.random().key.toString('hex');
  }

  async decryptPrivateKey(key: string, address: string, salt: string, n: string = '16384', password: string) {
    const account = Account.deserializeJson(
      {
        address,
        algorithm: 'ECDSA',
        'enc-alg': 'aes-256-gcm',
        hash: 'sha256',
        isDefault: true,
        key,
        label: 'label',
        lock: false,
        parameters: {
          curve: 'P-256'
        },
        publicKey: '03f631f975560afc7bf47902064838826ec67794ddcdbcc6f0a9c7b91fc8502583',
        salt,
        signatureScheme: 'SHA256withECDSA'
      },
      {
        r: 8,
        p: 8,
        keyLength: 64,
        N: Number(n)
      }
    );

    const sk = await account.decryptKey(password);

    return sk.key.toString('hex');
  }
}
