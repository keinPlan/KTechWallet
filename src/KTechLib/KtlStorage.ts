import { KtlAccountData } from "./KtlAccount";

export interface IKtlStorage {

    Load(key: string): string | null;
    Save(key: string, data: string): void;
}


export class KtlStorageWindowLocalStorage implements IKtlStorage {
    constructor() { return; }
    Load(key: string): string | null {
        return window.localStorage.getItem(key);
    }

    Save(key: string, data: string): void {
        if (data === "") {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, data);
        }
    }
}

export class KtlStorageDummy implements IKtlStorage {
    private dummydata = new Map<string, string>();

    Load(key: string): string | null {
        let data: string | undefined = undefined;

        if (this.dummydata.has(key)) {
            data = this.dummydata.get(key);
        }

        if (!data) {
            return null;
        }

        return data;
    }

    Save(key: string, data: string): void {
        this.dummydata.set(key, data);
    }
}