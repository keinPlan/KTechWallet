import { Hash, Kdf, Aes, eKeyTypes, EcCrypto, RNG } from "./KtlCrypto";
import { PascalPublicKey } from "./PascalCoin/PascalCoin";
import { IKtlStorage } from "./KtlStorage";
import { Uint8ArrayFromHex, Uint8ArrayToHex } from "./Helper";


const KEY_MANAGER_STORAGE_NAME: string = "#KeyManager";

export interface IPrivateKey {
    keytype: eKeyTypes;
    encryptedKey: Uint8Array;
}

export class KtlKey {
    public kdfHash!: Uint8Array;
    public salt!: Uint8Array;
    public keys: Map<string, IPrivateKey> = new Map<string, IPrivateKey>();
}

export class KtlKeyManager {

    private keystorage: KtlKey = new KtlKey();
    private kdfResult: Uint8Array | null = null;


    private constructor(public storage: IKtlStorage) {
        this.storage = storage;
    }

    public static async Create(storage: IKtlStorage): Promise<KtlKeyManager> {
        let temp: KtlKeyManager = new KtlKeyManager(storage);
        return temp.Init().then(() => temp);
    }

    private async Init(): Promise<void> {

        let data: string = await this.storage.Load(KEY_MANAGER_STORAGE_NAME);

        if (data) {
            this.Import(data, false);
        } else {
            console.log("KeyManager: no keys to import ");
        }
    }

    public Export(): string {

        let keys: Object[] = new Array<Object>(0);
        this.keystorage.keys.forEach((v, key) => {
            keys.push({ keytype: v.keytype, encryptedKey: Uint8ArrayToHex(v.encryptedKey), publicKey: key });
        });

        return JSON.stringify(
            {
                kdfHash: Uint8ArrayToHex(this.keystorage.kdfHash),
                salt: Uint8ArrayToHex(this.keystorage.salt),
                keys: keys
            }, null, 1);
    }

    public Import(data: string, save: boolean = true): void {

        let decData: {
            kdfHash: string,
            salt: string,
            keys: { keytype: string, encryptedKey: string, publicKey: string }[],
        } = JSON.parse(data);

        this.keystorage.kdfHash = Uint8ArrayFromHex(decData.kdfHash);
        this.keystorage.salt = Uint8ArrayFromHex(decData.salt);

        decData.keys.forEach(key => {
            this.keystorage.keys.set(
                key.publicKey,
                <IPrivateKey>{
                    encryptedKey: Uint8ArrayFromHex(key.encryptedKey),
                    keytype: key.keytype
                }
            );
        });

        if (save) {
            this.Save();
        }
    }

    private Save(): void {
        console.log("KtlKeyManager.Save");
        this.storage.Save(KEY_MANAGER_STORAGE_NAME, this.Export());
    }



    public InitWithPassword(password: string): void {
        this.keystorage.salt = RNG.RngBytes(32);
        this.kdfResult = Kdf.Kdf2_Sha512_Salt(password, this.keystorage.salt);
        this.keystorage.kdfHash = Hash.SHA256(this.kdfResult);
        this.Save();
    }

    public InitDone(): boolean {
        if (this.keystorage.kdfHash && this.keystorage.salt) {
            return true;
        }
        return false;
    }

    get IsLocked(): boolean {
        return this.kdfResult === null;
    }

    public Unlock(password: string): string {

        this.kdfResult = Kdf.Kdf2_Sha512_Salt(password, this.keystorage.salt);

        let hash = Hash.SHA256(this.kdfResult);

        if (JSON.stringify(hash) !== JSON.stringify(this.keystorage.kdfHash)) {
            this.kdfResult = null;
            return "wrong password!";
        }

        return "";
    }

    public Delete(publicKey: string): void {
        this.keystorage.keys.delete(publicKey);
        this.Save();
    }

    public Lock(): void {
        this.kdfResult = null;
    }

    get GetPublicKeys(): string[] {
        return Array.from<string>(this.keystorage.keys.keys());
    }

    public AddRawPrivateKey(keytype: eKeyTypes, rawkey: Uint8Array): string {
        if (!this.kdfResult) {
            throw "Unlock first";
        }
        // publicKey
        let publickey = PascalPublicKey.CreateFromPrivateKey(keytype, rawkey);
        let b58PublicKey: string = publickey.EncodeBase58();

        // privateKey
        var encryptedEcKey = Aes.Encrypt_AES(this.kdfResult, rawkey);

        this.keystorage.keys.set(b58PublicKey, <IPrivateKey>{ encryptedKey: encryptedEcKey, keytype: keytype });

        this.Save();

        return b58PublicKey;
    }

    private UnPackKey(encryptedKey: IPrivateKey): Uint8Array {
        if (!this.kdfResult) {
            throw "Private Key is locked";
        }
        return Aes.Decrypt_AES(this.kdfResult, encryptedKey.encryptedKey);
    }

    public Sign(publicKey: string, data: Uint8Array): { r: Uint8Array, s: Uint8Array } {
        let encryptedKey = this.keystorage.keys.get(publicKey);
        if (!encryptedKey) {
            throw "no Key found for : " + publicKey;
        }
        return EcCrypto.sign(encryptedKey.keytype, this.UnPackKey(encryptedKey), data);
    }

    public ECDHDecrypt(publicKey: string, data: Uint8Array, sharedPublicKey: Uint8Array): Uint8Array {
        let encryptedKey = this.keystorage.keys.get(publicKey);
        if (!encryptedKey) {
            throw "no Key found for : " + publicKey;
        }
        let pk = this.UnPackKey(encryptedKey);
        return EcCrypto.ECDHDecrypt(encryptedKey.keytype, pk, sharedPublicKey, data);
    }

    public GetPublicKey(publicKey: string): PascalPublicKey {

        let encryptedKey = this.keystorage.keys.get(publicKey);
        if (!encryptedKey) {
            throw "no Key found for : " + publicKey;
        }
        let pk = this.UnPackKey(encryptedKey);
        return PascalPublicKey.CreateFromPrivateKey(encryptedKey.keytype, pk);
    }
}
