import {hash, genSalt, compare} from 'bcryptjs'

async function encrypt(rawPassword: string): Promise<string> {
  try {
    return await hash(rawPassword, await genSalt());
  } catch(e) {
    console.log('Encrypt error:', e);
    return '';
  }
}

async function verifyPassword(
  rawPassword: string,
  encryptedPassword: string
): Promise<boolean> {
  return compare(rawPassword, encryptedPassword);
}

export {encrypt, verifyPassword};
