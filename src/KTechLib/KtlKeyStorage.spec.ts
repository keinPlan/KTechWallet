import { KtlKeyStorage } from './KtlKeyStorage';

describe("KtlKeyStorage", () => {
    it("KtlKeyStorage", () => {
        let key1 = KtlKeyStorage.CreateFromRawKey(Buffer.from("010203040506", "hex"), "test");

        if (!key1.checkSum) {
            throw ("key1.checkSum not defined");
        }

        let key2 = KtlKeyStorage.CreateFromEncryptedKey(key1.encryptedKey, key1.salt, key1.checkSum);
        expect(key1).toEqual(key2);
    });

});
