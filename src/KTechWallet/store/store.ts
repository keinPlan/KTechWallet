import { KtlAccoutManager, KtlStorageWindowLocalStorage, GetAccount, IGetAccountResponse, GetAccountOperations, IGetAccountOperationsResponse } from "@/KTechLib/KTechLib";



export class Config {
  private storageKey: string = "#RPCSERVER";
  constructor() {
    var storage = new KtlStorageWindowLocalStorage();
    var serveraddress = storage.Load(this.storageKey);

    if (serveraddress !== null) {
      this.RpcServer = serveraddress;
    }
  }

  public RpcServer: string = "https://keinplan1337.ddns.net:1600";

  public SetRpcServer(serveraddress: string): void {
    this.RpcServer = serveraddress;
    var storage = new KtlStorageWindowLocalStorage();
    storage.Save(this.storageKey, serveraddress);
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
      var getacc: GetAccount = new GetAccount(accountNumber);

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


      let cmd = new GetAccountOperations(
        accountNumber,
        100,
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
  public static AccountManager: KtlAccoutManager = new KtlAccoutManager();
  public static WalletConfig: Config = new Config();
  public static DataProvider: DataProvider = new DataProvider(SharedObject.WalletConfig);
}


export default SharedObject;

