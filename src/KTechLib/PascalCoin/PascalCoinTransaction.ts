import { BinaryReaderWriter } from "../Helper";
import { Hash } from "../KtlCrypto";

export interface IPascalCoinOp {
    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array;
    BuildOpHash(): Uint8Array;
}

export class PascalCoinOpTransferMoney implements IPascalCoinOp {
    public optype: number = 1;
    constructor(
        public sender: number,
        public opcounter: number,
        public amount: number,
        public fee: number,
        public payload: Uint8Array,
        public target: number,
    ) {
    }

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {

        var buffer: BinaryReaderWriter = new BinaryReaderWriter();

        buffer.AddUInt32(this.optype);
        buffer.AddUInt32(this.sender);
        buffer.AddUInt32(this.opcounter);
        buffer.AddUInt32(this.target);

        buffer.AddUInt64(this.amount);
        buffer.AddUInt64(this.fee);

        if (this.payload && this.payload.length > 0) {
            buffer.AddUInt16(this.payload.length);
            buffer.AddBytes(this.payload);
        } else {
            buffer.AddUInt16(0);
        }
        buffer.AddUInt16(0); // keytype
        buffer.AddUInt16(0); // lenx
        buffer.AddUInt16(0); // leny
        // r
        if (r) {
            buffer.AddUInt16(r.length);
            buffer.AddBytes(r);
        } else {
            buffer.AddUInt16(0);
        }
        // s
        if (s) {
            buffer.AddUInt16(s.length);
            buffer.AddBytes(s);
        } else {
            buffer.AddUInt16(0);
        }

        return buffer.ToArray();
    }

    BuildOpHash(): Uint8Array {
        var buffer: BinaryReaderWriter = new BinaryReaderWriter();

        buffer.AddUInt32(this.sender);
        buffer.AddUInt32(this.opcounter);
        buffer.AddUInt32(this.target);

        buffer.AddUInt64(this.amount);
        buffer.AddUInt64(this.fee);

        if (this.payload && this.payload.length > 0) {
            buffer.AddBytes(this.payload);
        }
        buffer.AddUInt16(0);
        buffer.AddByte(this.optype);

        return Hash.SHA256(buffer.ToArray());
    }
}

export class PascalCoinOpOpData implements IPascalCoinOp {
    public optype: number = 10;
    constructor(
        public account_signer: number,
        public account_sender: number,
        public account_target: number,
        public n_operation: number,
        public dataType: number,
        public dataSequence: number,
        public amount: number,
        public fee: number,
        public payload: Uint8Array,
    ) {
    }

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {

        var buffer: BinaryReaderWriter = new BinaryReaderWriter();

        buffer.AddUInt32(this.optype);
        buffer.AddUInt32(this.account_signer);
        buffer.AddUInt32(this.account_sender);
        buffer.AddUInt32(this.account_target);
        buffer.AddUInt32(this.n_operation);
        buffer.AddUInt16(this.dataType);
        buffer.AddUInt16(this.dataSequence);
        buffer.AddUInt64(this.amount);
        buffer.AddUInt64(this.fee);

        if (this.payload && this.payload.length > 0) {
            buffer.AddUInt16(this.payload.length);
            buffer.AddBytes(this.payload);
        } else {
            buffer.AddUInt32(0);
        }

        // r
        if (r) {
            buffer.AddUInt16(r.length);
            buffer.AddBytes(r);
        } else {
            buffer.AddUInt16(0);
        }
        // s
        if (s) {
            buffer.AddUInt16(s.length);
            buffer.AddBytes(s);
        } else {
            buffer.AddUInt16(0);
        }

        return buffer.ToArray();
    }

    BuildOpHash(): Uint8Array {
        var buffer: BinaryReaderWriter = new BinaryReaderWriter();

        buffer.AddUInt32(this.account_signer);
        buffer.AddUInt32(this.account_sender);
        buffer.AddUInt32(this.account_target);
        buffer.AddUInt32(this.n_operation);
        buffer.AddUInt16(this.dataType);
        buffer.AddUInt16(this.dataSequence);
        buffer.AddUInt64(this.amount);
        buffer.AddUInt64(this.fee);

        if (this.payload && this.payload.length > 0) {
            buffer.AddUInt16(this.payload.length);
            buffer.AddBytes(this.payload);
        } else {
            buffer.AddUInt16(0);
        }

        buffer.AddByte(this.optype);

        return buffer.ToArray();
        // return Hash.SHA256(buffer.ToArray()); // doing everything the same way is so boring !!!! ;)
    }
}


// ----------------------------------------------------------------------------todo:
export class PascalCoinOpChangeKey implements IPascalCoinOp {
    public optype: number = 2;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpChangeKeySigned implements IPascalCoinOp {
    public optype: number = 7;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpRecoverFunds implements IPascalCoinOp {
    public optype: number = 3;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }

}

export class PascalCoinOpListAccountForSale implements IPascalCoinOp {
    public optype: number = 4;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpDelistAccount implements IPascalCoinOp {
    public optype: number = 5;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpBuyAccount implements IPascalCoinOp {
    public optype: number = 6;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpChangeAccountInfo implements IPascalCoinOp {
    public optype: number = 8;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}

export class PascalCoinOpMultiOperation implements IPascalCoinOp {
    public optype: number = 9;

    ToArray(r?: Uint8Array, s?: Uint8Array): Uint8Array {
        throw "not done jet";
    }

    BuildOpHash(): Uint8Array {
        throw "not done jet";
    }
}