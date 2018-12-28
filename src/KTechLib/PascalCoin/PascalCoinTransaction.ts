import { Buffer } from 'buffer';
import { BinaryReaderWriter } from '../Helper';
import { Hash } from '../KtlCrypto';



export class PascalCoinTransaction {
    public optype: number=1;
    constructor(
        public sender: number,
        public opcounter: number,
        public amount: number,
        public fee: number,
        public payload: Uint8Array,
        public target: number,
    ) {
    }

    build(r?: Uint8Array, s?: Uint8Array): Uint8Array {

        var buffer = new BinaryReaderWriter();

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
        //r
        if (r) {
            buffer.AddUInt16(r.length);
            buffer.AddBytes(r);
        } else {
            buffer.AddUInt16(0);
        }
        //s
        if (s) {
            buffer.AddUInt16(s.length);
            buffer.AddBytes(s);
        } else {
            buffer.AddUInt16(0);
        }

        return buffer.ToArray();
    }

    BuildOpHash(): Uint8Array {
        var buffer = new BinaryReaderWriter();

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