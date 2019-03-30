import { IKtlStorage, KtlStorageWindowLocalStorage } from "./KtlStorage";


const WALLET_MANAGER_STORAGE_NAME: string = "#WalletManager";

export enum eCoinType {
    NONE = "NONE",
    PASCAL = "PASCAL",
    ETH = "ETH"
}

export class KtlWalletManager {
    private storage: IKtlStorage = new KtlStorageWindowLocalStorage();
    private wallets: Map<string, KtlWallet> = new Map<string, KtlWallet>();

    public static async Create(storage: IKtlStorage): Promise<KtlWalletManager> {
        let temp: KtlWalletManager = new KtlWalletManager(storage);
        return await temp.Init().then(() => temp);
    }

    private async Init(): Promise<void> {

        let data: string = await this.storage.Load(WALLET_MANAGER_STORAGE_NAME);
        if (!data) {
            console.log("no stored wallets found ");
            return;
        }

        this.Import(data,false);

        return;
    }

    private constructor(storage: IKtlStorage) {
        this.storage = storage;
    }

    public GetWalletNames(): Array<string> {
        return Array.from<string>(this.wallets.keys());
    }

    public GetWalletByName(name: string): KtlWallet | undefined {
        return this.wallets.get(name);
    }

    public AddWallet(wallet: KtlWallet, save: boolean = true): void {
        this.wallets.set(wallet.Name, wallet);
        if (save) {
            this.Save();
        }
    }

    public Save(): void {
        console.log("KtlWalletManager.Save");
        this.storage.Save(WALLET_MANAGER_STORAGE_NAME, this.Export());
    }

    public Delete(accountName: string): void {
        this.wallets.delete(accountName);
        this.Save();
    }

    public Export(): string {
        return JSON.stringify(Array.from(this.wallets.values()));
    }

    public Import(data: string, save: boolean = true): void {
        let wallets: KtlWallet[] = JSON.parse(data);
        wallets.forEach(w => this.AddWallet(w,false));
        if (save) {
            this.Save();
        }
    }
}

export class KtlWallet {
    public constructor(
        public Name: string,
        public CoinType: eCoinType,
        public AccountNumber: number,
        public PublicKey: string,
        public LastUpdate: number
    ) {
    }
}
