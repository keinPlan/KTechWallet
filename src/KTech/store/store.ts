import {
  IKtlStorage,
  KtlWalletManager,
  KtlStorageWindowLocalStorage,
  RpcGetAccount,
  IGetAccountResponse,
  RpcGetAccountOperations,
  IGetAccountOperationsResponse,
  KtlContactsManager,
  KtlKeyManager
} from "@/KTechLib/KTechLib";




export class Config {
  private storageKey: string = "#RPCSERVER";
  private storage: IKtlStorage;

  private constructor(storage: IKtlStorage) {
    this.storage = storage;
  }

  public static async Create(storage: IKtlStorage): Promise<Config> {
    let temp: Config = new Config(storage);
    return temp.Init().then(() => {
      if (!temp.RpcServer) {
        temp.RpcServer = "https://keinplan1337.acedns.org:1600";
      }
      return temp;
    });
  }

  private async Init(): Promise<string> {
    return await this.storage.Load(this.storageKey).then((server) => this.RpcServer = server);
  }



  public RpcServer: string = "https://keinplan1337.acedns.org:1600";

  public SetRpcServer(serveraddress: string): void {
    this.RpcServer = serveraddress;
    this.storage.Save(this.storageKey, serveraddress);
  }
}

export class DataProvider {
  private GetAccountInfos: Map<number, IGetAccountResponse> = new Map<number, IGetAccountResponse>();
  private GetAccountInfosTime: Map<number, number> = new Map<number, number>();

  private GetAccountOperationsInfos: Map<number, IGetAccountOperationsResponse[]> = new Map<number, IGetAccountOperationsResponse[]>();
  private GetAccountOperationsInfoTimes: Map<number, number> = new Map<number, number>();

  constructor(public WalletConfig: Config) { console.log("DataProvider created !!"); }

  GetAccountInfo(accountNumber: number, forceUpdate: boolean = false): Promise<IGetAccountResponse> {
    let lastUpdate: number | undefined = this.GetAccountInfosTime.get(accountNumber);
    let now: number = Date.now();

    if (forceUpdate || !lastUpdate || (lastUpdate + 5 * 60 * 1000) < now) {
      var getacc: RpcGetAccount = new RpcGetAccount(accountNumber);

      var req = getacc.Execute(this.WalletConfig.RpcServer);
      req.then(value => {
        this.GetAccountInfos.set(accountNumber, value);
        this.GetAccountInfosTime.set(accountNumber, Date.now());
      });

      return req;
    }

    let data: IGetAccountResponse | undefined = this.GetAccountInfos.get(accountNumber);

    if (!data) {
      return Promise.reject<IGetAccountResponse>("unexpected error");
    }

    return Promise.resolve<IGetAccountResponse>(data);
  }

  GetAccountOperations(accountNumber: number, forceUpdate: boolean = false): Promise<IGetAccountOperationsResponse[]> {
    let lastUpdate: number | undefined = this.GetAccountOperationsInfoTimes.get(accountNumber);
    let now: number = Date.now();

    if (forceUpdate || !lastUpdate || (lastUpdate + 5 * 60 * 1000) < now) {


      let cmd = new RpcGetAccountOperations(
        accountNumber,
        10,
        -1 // -1 for pending
      );

      let promise = cmd.Execute(this.WalletConfig.RpcServer);


      promise.then(v => {
        this.GetAccountOperationsInfos.set(accountNumber, v);
        this.GetAccountOperationsInfoTimes.set(accountNumber, Date.now());

      });
      return promise;

    }

    let data: IGetAccountOperationsResponse[] | undefined = this.GetAccountOperationsInfos.get(accountNumber);

    if (!data) {
      return Promise.reject<IGetAccountOperationsResponse[]>("unexpected error");
    }

    return Promise.resolve<IGetAccountOperationsResponse[]>(data);
  }
}



class SharedObject {

  public static IsReady: boolean = false;



  private static storage: IKtlStorage;
  private static loadingDone: boolean = false;
  public static WalletManager: KtlWalletManager;
  public static ContactsManager: KtlContactsManager;
  public static WalletConfig: Config;
  public static DataProvider: DataProvider;
  public static KeyManager:KtlKeyManager;

  public static async Init(storage: IKtlStorage) {
    this.storage = storage;
    SharedObject.loadingDone = false;

    try {
      let p1 = await KtlWalletManager.Create(storage)
        .then((obj) => {
          SharedObject.WalletManager = obj;
          console.log("KtlWalletManager Init done");
        });

      let p2 = await Config.Create(storage).then((obj) => {
        SharedObject.WalletConfig = obj;
        SharedObject.DataProvider = new DataProvider(SharedObject.WalletConfig);
      });
      let p3 = await KtlKeyManager.Create(storage)
        .then((obj) => {
          SharedObject.KeyManager = obj;
          console.log("KtlKeyStorage Init done");
        });

      let p4 = await KtlContactsManager.Create(storage).then((manager) => {
        SharedObject.ContactsManager = manager;
        console.log(SharedObject);
      });

      this.loadingDone = this.IsReady = true;
    } catch (error) {
      console.log(error);
      throw error;
    }

    return;




    return Promise.all([
      // p1
      KtlWalletManager.Create(storage)
        .then((obj) => {
          SharedObject.WalletManager = obj;
          console.log("KtlWalletManager Init done");
        })
        .catch((err) => console.log("KtlWalletManager: " + err)),
      // p2
      Config.Create(storage).then((obj) => {
        SharedObject.WalletConfig = obj;
        SharedObject.DataProvider = new DataProvider(SharedObject.WalletConfig);
      }).catch((err) => console.log("KtlWalletManager: " + err)),
      // p3
      KtlKeyManager.Create(storage)
        .then((obj) => {
          SharedObject.KeyManager = obj;
          console.log("KtlKeyStorage Init done");
        })
        .catch((err) => console.log("KtlKeyStorage: " + err)),
      // p4
      KtlContactsManager.Create(storage).then((manager) => {
        SharedObject.ContactsManager = manager;
        console.log(SharedObject);
      }).catch((v) => console.log(v))
    ]).then(() => this.loadingDone = this.IsReady = true);
  }


}


export default SharedObject;

