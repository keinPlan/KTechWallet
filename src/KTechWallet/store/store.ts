import { KtlAccoutManager, KtlStorageWindowLocalStorage } from "@/KTechLib/KTechLib";



export class Config {
  private  storageKey :string ="#RPCSERVER";
  constructor() {
    var storage = new KtlStorageWindowLocalStorage();
    var serveraddress = storage.Load(this.storageKey);

    if (serveraddress === null) {
      this.RpcServer = "https://keinplan1337.ddns.net:1600";
    } else {
      this.RpcServer = serveraddress;
    }

  }
  public RpcServer: string = "https://keinplan1337.ddns.net:1600";

  public SetRpcServer(serveraddress:string):void{
    this.RpcServer = serveraddress;
    var storage = new KtlStorageWindowLocalStorage();
    storage.Save(this.storageKey , serveraddress);
  }
}



class SharedObject {
  public static AccountManager: KtlAccoutManager = new KtlAccoutManager();
  public static WalletConfig: Config = new Config();
}


export default SharedObject;

