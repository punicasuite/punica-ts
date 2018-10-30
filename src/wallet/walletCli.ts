import { otherError } from '../exception/punicaException';
import { questionAsync } from '../utils/async';

export async function inputNewPassword() {
  const password = await questionAsync('Please input password: ');
  const passwordRepeat = await questionAsync('Please repeat password: ');

  if (password !== passwordRepeat) {
    throw otherError('Password did not match');
  } else {
    return password;
  }
}

export async function inputExistingPassword(msg = 'Please input account password: ') {
  return await questionAsync(msg);
}
