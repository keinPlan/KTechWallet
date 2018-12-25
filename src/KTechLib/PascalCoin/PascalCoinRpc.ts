
import axios, * as ax from "axios";
export abstract class RpcRequest {
    jsonrpc = "2.0";
    method = "";
    params: any;
    
    static Execute<T>(request: RpcRequest , server:string ="http://localhost:4003"): Promise<T> {

        return new Promise((resolve, reject) => {
            axios.post( server, JSON.stringify(request)).then((response) => {
                console.log(response);
                resolve(response.data.result as T);
            }, (err) => {
                reject(err);
            });
        });
    }

}


export class GetAccountOperations extends RpcRequest {
    /*
    account : Integer - Account number (0..accounts count-1)
    depth : Integer - (Optional, default value 100) Depth to search on blocks where this account has been affected. Allowed to
    use deep as a param name too.

    start Integer (optional, default = 0). If provided, will start at this position (index starts at position 0). If start is -1,
    then will include pending operations, otherwise only operations included on the blockchain
    max Integer (optional, default = 100). If provided, will return max registers. If not provided, max=100 by default */
    constructor(account: number, depth?: number, start?: number, max?: number) {
        super();

        this.method = "getaccountoperations";
        this.params = {
            account,
            depth,
            start,
            max
        };
    }

    protected Callback(response: any): any {
        console.log(response);
        return;
    }
    protected CallbackOnError(response: any): any {
        console.log(response);
        return;
    }
}


export interface IGetAccountResponse {
    account: number;
    enc_pubkey: string;
    balance: number;
    n_operation: number;
    updated_b: number;
}

export class GetAccount extends RpcRequest {
    /*
    account : Integer - Account number (0..accounts count-1)
    depth : Integer - (Optional, default value 100) Depth to search on blocks where this account has been affected. Allowed to
    use deep as a param name too.

    start Integer (optional, default = 0). If provided, will start at this position (index starts at position 0). If start is -1,
    then will include pending operations, otherwise only operations included on the blockchain
    max Integer (optional, default = 100). If provided, will return max registers. If not provided, max=100 by default */
    constructor(account: number) {
        super();

        this.method = "getaccount";
        this.params = {
            account,
        };
    }

    public Execute(server:string ="http://localhost:4003"): Promise<IGetAccountResponse> {
        return RpcRequest.Execute<IGetAccountResponse>(this,server);
    }
}


export interface ICreateOperationResponse {
    operations: number;
    ampount: number;
    fee: number;
    rawoperations: string;
}

export class CreateOperation extends RpcRequest {
    constructor(
        sender: number,
        target: number,
        sender_b58_pubkey: string,
        target_b58_pubkey: string,
        last_n_operation: number,
        amount: number,
        fee: number,
        payload: String,
        payload_method: String,
        pwd: string,
        rawoperations: string,
    ) {
        super();

        this.method = "signsendto";
        this.params = {
            sender,
            target,
            sender_b58_pubkey,
            target_b58_pubkey,
            last_n_operation,
            amount,
            fee,
            payload,
            payload_method,
            pwd,
            rawoperations
        };
    }

    public Execute(server:string ="http://localhost:4003"): Promise<ICreateOperationResponse> {
        console.log(this, server);
        return RpcRequest.Execute<ICreateOperationResponse>(this);
    }
}

//
//
//
export interface IExecuteOperationsResponse {
    valid: boolean;
    errors: string;
    block: number;
    time: number;
    opblock: number;
    maturation: number;
    optype: number;
    account: number;
    optxt: string;
    amount: number;
    fee: number;
    balance: number;
    ophash: string;
    subtype: string;
}

export class ExecuteOperations extends RpcRequest {
    constructor(rawoperations: string, ) {
        super();

        this.method = "executeoperations";
        this.params = { rawoperations };
    }

    public Execute(server:string ="http://localhost:4003"): Promise<IExecuteOperationsResponse[]> {
        return RpcRequest.Execute<IExecuteOperationsResponse[]>(this,server);
    }
}