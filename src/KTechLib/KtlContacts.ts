import { IKtlStorage } from "./KtlStorage";

const CONTACTS_MANAGER_STORAGE_NAME: string = "#ContactsManager";

export class KtlContactsManager {
    private storage: IKtlStorage;
    private contacts: Map<string, IKtlContact> = new Map<string, IKtlContact>();

    private constructor(storage: IKtlStorage) {
        this.storage = storage;
    }

    public static Create(storage: IKtlStorage): Promise<KtlContactsManager> {
        let temp: KtlContactsManager = new KtlContactsManager(storage);
        return temp.Init().then(() => temp);
    }
    private async Init(): Promise<void> {
        let data: string = await this.storage.Load(CONTACTS_MANAGER_STORAGE_NAME);

        if (!data) {
            console.log("no stored contacts found ");
            return;
        }

        this.Import(data, false);
    }

    public GetAccountNames(): Array<string> {
        return Array.from<string>(this.contacts.keys());
    }

    public GetAccountByName(name: string): IKtlContact | undefined {
        return this.contacts.get(name);
    }

    public Add(contact: IKtlContact, save: boolean = true): void {
        this.contacts.set(contact.ContactName, contact);
        if (save) { this.Save(); }
    }

    public Delete(name: string): void {
        this.contacts.delete(name);
        this.Save();
    }

    public Save(): void {
        console.log("KtlContactsManager.Save");
        this.storage.Save(CONTACTS_MANAGER_STORAGE_NAME, this.Export());
    }

    public Export(): string {
        return JSON.stringify(Array.from<IKtlContact>(this.contacts.values()));
    }

    public Import(data: string, save: boolean = true): void {
        let array: IKtlContact[] = JSON.parse(data);
        if (array) {
            array.forEach((v) => this.Add(v, false));
        }
        if (save) {
            this.Save();
        }
    }
}

export interface IKtlContact {
    ContactName: string;
    ContactAccountNumber: number;
    ContactAccountNumberCheckSum: number;
}
