import * as bcrypt from 'bcrypt';

export class Hash {
  static saltOrRounds = 10;

  static async encrypt(text: string) {
    const res = await bcrypt.hash(text, this.saltOrRounds);
    return res;
  }

  static async compare(text: string, encryptedText: string) {
    const isMatch = await bcrypt.compare(text, encryptedText);
    return isMatch;
  }
}
