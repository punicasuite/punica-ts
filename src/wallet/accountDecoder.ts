import { createDecipheriv, scryptSync } from 'crypto';
import { Address, CurveLabel, KeyParameters, KeyType, PrivateKey } from 'ontology-ts-test';
import { Account, SCrypt } from '../config/configTypes';
import { otherError } from '../exception/punicaException';

export function decodeAccount(account: Account, password: string, scryptParams: SCrypt) {
  let salt: Buffer;
  if (account.salt.length === 24 && isBase64(account.salt)) {
    salt = Buffer.from(account.salt, 'base64');
  } else {
    salt = Buffer.from(account.salt, 'hex');
  }

  const decrypted: string = decryptWithGcm(account.key, account.address, salt, password, scryptParams);

  const sk = new PrivateKey(
    decrypted,
    KeyType.fromLabel(account.algorithm),
    new KeyParameters(CurveLabel.fromLabel(account.parameters.curve))
  );
  const pk = sk.getPublicKey();
  const address = Address.fromPubKey(pk);

  if (address.toBase58() !== account.address) {
    throw otherError('Wrong password');
  }

  return sk.key.toString('hex');
}

function isBase64(str: string): boolean {
  return Buffer.from(str, 'base64').toString('base64') === str;
}

function decryptWithGcm(encrypted: string, address: string, salt: Buffer, keyphrase: string, scryptParams: SCrypt) {
  const result = Buffer.from(encrypted, 'base64');
  const ciphertext = result.slice(0, result.length - 16);
  const authTag = result.slice(result.length - 16);
  const derived = scrypt(keyphrase, salt, scryptParams);
  const derived1 = derived.slice(0, 12);
  const derived2 = derived.slice(32);
  const key = derived2;
  const iv = derived1;
  const aad = new Buffer(address);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext).toString('hex');

  try {
    decrypted += decipher.final().toString('hex');
  } catch (err) {
    throw otherError('Decrypt error');
  }
  return decrypted;
}

/**
 * Synchronious call to scrypt-async-js.
 *
 * @param keyphrase Keyphrase to use
 * @param salt Hex encoded address
 * @param params Scrypt params
 */
function scrypt(keyphrase: string, salt: Buffer, params: SCrypt) {
  return scryptSync(keyphrase.normalize('NFC'), salt, params.dkLen, {
    N: params.n,
    r: params.r,
    p: params.p
  });
}
