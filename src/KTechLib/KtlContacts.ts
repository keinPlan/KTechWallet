import { IKtlStorage, KtlStorageWindowLocalStorage } from "./KtlStorage";

const ACCOUNT_STORAGE_PREFIX: string = "#CONTACTS_";
const ACCOUNT_MANAGER_Storage: string = "#CONTACTSMStorage";

export class KtlContactsManager {
    private storage: IKtlStorage = new KtlStorageWindowLocalStorage();
    private contacts: Map<string, IKtlContact> = new Map<string, IKtlContact>();

    constructor() {
        let data = this.storage.Load(ACCOUNT_MANAGER_Storage);
        if (data) {
            let contactsNames: Array<string> = JSON.parse(data);

            contactsNames.forEach((value) => {
                let contactdata = this.storage.Load(ACCOUNT_STORAGE_PREFIX + value);
                if (contactdata) {
                    this.contacts.set(value, <IKtlContact>JSON.parse(contactdata));
                }
            });
        } else {
            console.log("no stored contacts found ");
        }
    }

    public GetAccountNames(): Array<string> {
        return Array.from<string>(this.contacts.keys());
    }

    public GetAccountByName(name: string): IKtlContact | undefined {
        return this.contacts.get(name);
    }

    public Add(contact: IKtlContact): void {
        this.contacts.set(contact.ContactName, contact);

        this.SaveKeys();
        this.SaveContact(contact);
    }

    public Delete(name: string): void {
        this.contacts.delete(name);
        this.storage.Save(ACCOUNT_STORAGE_PREFIX + name, "");
        this.SaveKeys();
    }

    private SaveKeys(): void {
        this.storage.Save(ACCOUNT_MANAGER_Storage, JSON.stringify(this.GetAccountNames()));
    }

    private SaveContact(contact: IKtlContact): void {
        this.storage.Save(ACCOUNT_STORAGE_PREFIX + contact.ContactName, JSON.stringify(contact));
    }


}

export interface IKtlContact {
    ContactName: string;
    ContactAccountNumber: number;
    ContactAccountNumberCheckSum: number;
}
