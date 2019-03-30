

export enum eKtlStorageState {
    Connected,
    Disconnected,
    Busy
}


export interface IKtlStorage {

    IsConnected: boolean;
    Connect(callback: (result: string) => {}): void;
    DisConnect(callback: (result: string) => {}): void;

    Load(key: string): Promise<string>;
    Save(key: string, data: string): void;
}


export class KtlStorageWindowLocalStorage implements IKtlStorage {

    get IsConnected(): boolean { return true; }

    Connect(): void { return; }
    DisConnect(): void { return; }

    Load(key: string): Promise<string> {
        let data: string | null = window.localStorage.getItem(key);
        if (data) {
            return Promise.resolve(data);
        }
        return Promise.resolve("");
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

    get IsConnected(): boolean { return true; }

    Connect(): void { return; }
    DisConnect(): void { return; }


    Load(key: string): Promise<string> {

        let data: string | undefined = undefined;

        if (this.dummydata.has(key)) {
            data = this.dummydata.get(key);
        }
        if (data) {
            return Promise.resolve(data);
        }
        return Promise.reject("loading data failed");
    }



    Save(key: string, data: string): void {
        this.dummydata.set(key, data);
    }
}
