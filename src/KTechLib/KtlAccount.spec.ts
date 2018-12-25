import { KtlStorageDummy } from './KtlStorage';
import { KtlAccount, KtlAccountData, eCoinType } from './KtlAccount';
import { eKeyTypes } from './KtlCrypto';
import { KtlKeyStorage } from './KtlKeyStorage';

describe("KtlAccount", () => {

  let acc: KtlAccount;
  let accData: KtlAccountData;
  let storage: KtlStorageDummy = new KtlStorageDummy();

  let keyTyp = eKeyTypes.SECP256K1;
  let privatekey = "012760234450B1DAAFF23E179E59E07F4FBE30670E83ABE5794AE2EE8814CFBA";
  let publickeyBase58 = "3Ghhbojn7gpYMHxz8nyUZei6hKsdjczjqtBVC5VpUMu7snV7jDnnc1Hi4rRVKu2voKHZ52m6SYdNuixuKkyWs4NeDzWCdiD4QHyFwe";
  let password = "test123";

  it("Create KtlAccountData", () => {
    accData = new KtlAccountData(
      eCoinType.PASCAL,
      555555,
      keyTyp,
      publickeyBase58,
      0,
      KtlKeyStorage.CreateFromRawKey(Buffer.from(privatekey, "hex"), password));

    expect(accData.CoinType).toBe(eCoinType.PASCAL);
    expect(accData.AccountNumber).toBe(555555);
    expect(accData.AccountPublicKey).toBe(publickeyBase58);
    expect(accData.KeyType).toBe(keyTyp);
    expect(accData.EncryptedPrivateKey).not.toBe(null);
  });

  it("Create KtlAccount", () => {
    acc = new KtlAccount("test", storage, accData);
    acc = new KtlAccount("test2", storage, accData);

    expect(acc.AccountData.CoinType).toBe(eCoinType.PASCAL);
    expect(acc.AccountData.AccountNumber).toBe(555555);
    expect(acc.AccountData.AccountPublicKey).toBe(publickeyBase58);
    expect(acc.AccountData.KeyType).toBe(keyTyp);
    expect(acc.AccountData.EncryptedPrivateKey).not.toBe(null);
    expect(acc.AccountName).toBe("test2");
  });

  it("Load KtlAccount", () => {
    let temp = KtlAccount.LoadAccount("test3", storage);
    expect(temp).toBe(null);

    temp = KtlAccount.LoadAccount("test", storage);
    if (!temp) {
      throw "null error";
    }
    temp.AccountName = "test2";
    let temp2 = KtlAccount.LoadAccount("test2", storage);
    expect(temp).not.toBe(null);
    expect(temp2).not.toBe(null);
    expect(temp).toEqual(temp2);
  });

  it("Save/Load Account", () => {
    let temp = KtlAccount.LoadAccount("test", storage);
    if (!temp) {
      throw "null error";
    }
    temp.AccountName = "test4";
    temp.AccountData.AccountNumber = 44444;
    temp.Save();
    let temp2 = KtlAccount.LoadAccount("test4", storage);
    expect(temp).toEqual(temp2);

  });
});
