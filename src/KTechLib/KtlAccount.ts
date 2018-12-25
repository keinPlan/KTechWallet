import { IKtlStorage, KtlStorageWindowLocalStorage } from './KtlStorage';
import { KtlKeyStorage } from './KtlKeyStorage';
import { KeyTypes } from './KtlCrypto';
import {  Uint8ArrayFromHex ,Uint8ArrayToHex} from './Helper';


const ACCOUNT_STORAGE_PREFIX: string = "#ACC_";
const ACCOUNT_MANAGER_Storage: string = "#ACCMStorage";

export enum eCoinType {
    NONE = "NONE",
    PASCAL = "PASCAL",
    ETH = "ETH"
}

export class KtlAccoutManager {
    private storage: IKtlStorage = new KtlStorageWindowLocalStorage();
    private accounts: Map<string, KtlAccount> = new Map<string, KtlAccount>();


    constructor() {
        let data = this.storage.Load(ACCOUNT_MANAGER_Storage);
        if (data) {
            let accountNames: Array<string> = JSON.parse(data);

            accountNames.forEach((value) => {
                var acc = KtlAccount.LoadAccount(value, this.storage);
                if (acc) {
                    this.accounts.set(value, acc);

                } else {
                    console.log("failed to load account:" + value);
                }
            });
        } else {
            console.log("no stored Accounts found ");
        }
    }

    public GetAccountNames(): Array<string> {
        return Array.from<string>(this.accounts.keys());
    }
    public GetAccountByName(name: string): KtlAccount | undefined {
        return this.accounts.get(name);
    }
    public AddAcount(acc: KtlAccount): void {
        this.accounts.set(acc.AccountName, acc);
        this.Save();
    }
    public Save(): void {
        this.storage.Save(ACCOUNT_MANAGER_Storage, JSON.stringify(Array.from(this.accounts.keys())));
    }
    public DeleteAccount(accountName: string): void {
        this.accounts.get(accountName)!.Delete();
        this.accounts.delete(accountName);
        this.Save();
    }

    public Export(): string {
        let data: string = "";

        this.accounts.forEach((acc, key) => {
            data += acc.AccountName + "\n" + acc.AccountData.ToString() + "\n";
        });

        return data;
        return JSON.stringify(Array.from(this.accounts.entries()), null, 2);
    }

    public Import(data: string): void {
        let split = data.split("\n");

        for (let index: number = 0; index <= split.length - 2; index += 2) {
            console.log(split[index]);
            let accdata = KtlAccountData.FromString(split[index + 1]);

            let acc = new KtlAccount(split[index], this.storage, accdata);
            if (acc != null) {

                this.accounts.set(split[index], acc);
            }

        }

        this.Save();
    }


}

export class KtlAccount {
    public constructor(
        public AccountName: string,
        public AccountStorage: IKtlStorage,
        public AccountData: KtlAccountData
    ) {
        this.Save();
    }

    public Save(): void {
        this.AccountStorage.Save(ACCOUNT_STORAGE_PREFIX + this.AccountName, this.AccountData.ToString());
    }

    public Delete(): void {
        this.AccountStorage.Save(ACCOUNT_STORAGE_PREFIX + this.AccountName, "");
    }

    static LoadAccount(accountName: string, accountStorage: IKtlStorage): KtlAccount | null {
        let data: string | null = accountStorage.Load(ACCOUNT_STORAGE_PREFIX + accountName);
        if (!data) {
            return null;
        }

        return new KtlAccount(accountName, accountStorage, KtlAccountData.FromString(data));
    }
}

export class KtlAccountData {
    constructor(
        public CoinType: eCoinType,
        public AccountNumber: number,
        public KeyType: KeyTypes,
        public AccountPublicKey: string,
        public EncryptedPrivateKey: KtlKeyStorage) {
    }

    public ToString(): string {
        let temp: IStorageData = {
            CoinType: this.CoinType,
            AccountNumber: this.AccountNumber,
            KeyType: this.KeyType,
            AccountPublicKey: this.AccountPublicKey,
            salt: Uint8ArrayToHex(this.EncryptedPrivateKey.salt),
            encryptedKey: Uint8ArrayToHex(this.EncryptedPrivateKey.encryptedKey),
            checkSum: this.EncryptedPrivateKey.checkSum ? Uint8ArrayToHex(this.EncryptedPrivateKey.checkSum) : "",
        };

        return JSON.stringify(temp);
    }

    public static FromString(data: string) {
        let temp: IStorageData = JSON.parse(data);

        return new KtlAccountData(
            temp.CoinType,
            temp.AccountNumber,
            temp.KeyType,
            temp.AccountPublicKey,
            new KtlKeyStorage(
                Uint8ArrayFromHex(temp.encryptedKey),
                Uint8ArrayFromHex(temp.salt),
                temp.checkSum !== "" ? Uint8ArrayFromHex(temp.checkSum) : undefined,
            )
        );
    }
}

interface IStorageData {
    CoinType: eCoinType;
    AccountNumber: number;
    KeyType: KeyTypes;
    AccountPublicKey: string;
    salt: string;
    encryptedKey: string;
    checkSum: string;
}