import { IBaseXEncoder, encoder } from "basex-encoder";
import * as mipher from "mipher";

export const base58: IBaseXEncoder = encoder("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");

export function Uint8ArrayToHex(data: Uint8Array): string {
    return mipher.Convert.bin2hex(data);
}

export function Uint8ArrayFromHex(data: string): Uint8Array {
    return mipher.Convert.hex2bin(data);
}

export class BinaryReaderWriter {
    public index: number = 0;
    public view: DataView;
    public buffer: Uint8Array;
    constructor(buffer?: Uint8Array) {
        if (!buffer) {
            this.buffer = new Uint8Array(512);
            this.view = new DataView(this.buffer.buffer);
            return;
        }
        this.buffer = buffer;
        this.view = new DataView(this.buffer.buffer);
        return;
    }
    AddByte(n: number): void {
        this.view.setUint8(this.index, n);
        this.index += 1;
    }
    AddUInt16(n: number): void {
        this.view.setUint16(this.index, n, true);
        this.index += 2;
    }

    AddUInt32(n: number): void {
        this.view.setUint32(this.index, n, true);
        this.index += 4;
    }
    AddUInt64(n: number): void {
        if (n > Number.MAX_SAFE_INTEGER) {
            throw "number to big to handle";
        }

        let nu1: number = (n / 0x100000000);
        this.view.setUint32(this.index + 4, nu1, true);
        // let nu2: number = (n & 0xffffffff);
        this.view.setUint32(this.index, n, true);

        this.index += 8;
    }
    AddBytes(bytes: Uint8Array): void {

        let i: number = 0;
        let len: number = bytes.length;

        for (; i < len; i++) {

            this.view.setUint8(this.index++, bytes[i]);
        }
    }
    ReadByte(): number {
        return this.view.getUint8(this.index++);
    }
    ReadUInt16(): number {
        this.index += 2;
        return this.view.getUint16(this.index - 2, true);
    }

    ReadUInt32(): number {
        this.index += 4;
        return this.view.getUint32(this.index - 4, true);
    }
    ReadUInt64(): number {
        let nu1: number = this.ReadUInt32();
        let nu2: number = this.ReadUInt32();

        if (nu2 > 0x1FFFFF) {
            throw "number to big to handle";
        }

        return nu2 * 0x100000000 + nu1;
    }
    ReadBytes(n: number): Uint8Array {
        this.index += n;
        return new Uint8Array(this.view.buffer.slice(this.index - n, this.index));
    }

    ToArray(): Uint8Array {
        return this.buffer.slice(0, this.index);
    }
}

export function StringToHexString(str: string): string {
    var arr1:string[] = [];
    for (var n:number = 0, l:number = str.length; n < l; n++) {
        var hex:string = Number(str.charCodeAt(n)).toString(16);
        if (hex.length === 1) {
            hex = "0" + hex;
        }
        arr1.push(hex);
    }
    return arr1.join("");
}

export function HexStringToAsciiString(hex: string): string {
    var str:string = "";

    if (hex.length % 2 !== 0) {
        hex = "0" + hex;
    }

    for (var n:number = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}