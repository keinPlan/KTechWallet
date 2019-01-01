import { Hash, Kdf, Aes, eKeyTypes, EcCrypto } from './KtlCrypto';
import { PascalPublicKey } from './PascalCoin/PascalCoin';

export class KtlKeyStorage {

    public constructor(
        public encryptedKey: Uint8Array,
        public salt: Uint8Array,
        public checkSum?: Uint8Array) {

        if (checkSum) {
            var temp = this.CalcCheckSum();

            for (let index: number = 0; index < checkSum.length; index++) {
                if (temp[index] !== checkSum[index]) {
                    throw "Key corrupted !!!";
                }
            }
        } else {
            this.checkSum = this.CalcCheckSum();
        }
    }

    private CalcCheckSum(): Uint8Array {
        return Hash.SHA256(this.encryptedKey, this.salt).subarray(0, 8);
    }

    public static CreateFromRawKey(rawkey: Uint8Array, password: string): KtlKeyStorage {
        let key = Kdf.Kdf2_Sha512(password, 32);

        var encryptedEcKey = Aes.Encrypt_AES(key.key, rawkey);

        return new KtlKeyStorage(encryptedEcKey, key.salt);
    }

    public static CreateFromEncryptedKey(encryptedEcKey: Uint8Array, salt: Uint8Array, checkSum: Uint8Array): KtlKeyStorage {
        return new KtlKeyStorage(encryptedEcKey, salt, checkSum);
    }

    public UnPackKey(password: string): Uint8Array {
        let key = Kdf.Kdf2_Sha512_Salt(password, this.salt);
        return Aes.Decrypt_AES(key, this.encryptedKey);
    }

    public Sign(password: string, data: Uint8Array, keyType: eKeyTypes): { r: Uint8Array, s: Uint8Array } {
        return EcCrypto.sign(keyType, this.UnPackKey(password), data);
    }

    public ECDHDecrypt(keyType: eKeyTypes, password: string, data: Uint8Array, publicKey: Uint8Array): Uint8Array {
        return EcCrypto.ECDHDecrypt(keyType, this.UnPackKey(password), publicKey, data);
    }

    public GetPublicKey(keyType: eKeyTypes, password: string): PascalPublicKey {
        let pk = this.UnPackKey(password);
        return PascalPublicKey.CreateFromPrivateKey(keyType, pk);
    }
}
