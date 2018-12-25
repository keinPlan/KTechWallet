
import { Hash, Kdf, eKeyTypes, EcCrypto, Aes } from "../KtlCrypto";
import { Uint8ArrayToHex, base58, BinaryReaderWriter, Uint8ArrayFromHex } from '../Helper';

export class PascalPublicKey {
    public hash: Uint8Array;
    constructor(
        public version: number,
        public keytype: eKeyTypes,
        public x: Uint8Array,
        public y: Uint8Array,
        hash?: Uint8Array,
    ) {
        if (!hash) {
            this.hash = this.CalcHash();
        } else { this.hash = hash; }
    }

    public static CreateFromBase58Key(address: string): PascalPublicKey | null {
        let data: Uint8Array = new Uint8Array(base58.decodeToBuffer(address)!);
        if (!data) {
            throw "base58.decodeToBuffer(address, 'hex') failed";
        }

        let reader = new BinaryReaderWriter(data);
        let version: number = reader.ReadByte();
        let keytype: eKeyTypes = <eKeyTypes>Uint8ArrayToHex(reader.ReadBytes(2));
        let xlen: number = reader.ReadUInt16();
        let x: Uint8Array = reader.ReadBytes(xlen);
        let ylen: number = reader.ReadUInt16();
        let y: Uint8Array = reader.ReadBytes(ylen);
        let hash: Uint8Array = reader.ReadBytes(4);

        return new PascalPublicKey(version, keytype, x, y, hash);
    }

    public static CreateFromPrivateKey(keytype: eKeyTypes, privateKey: Uint8Array): PascalPublicKey {
        let version = 1;
        var key = EcCrypto.GetPublicKey_Raw(keytype, privateKey);
        return new PascalPublicKey(version, keytype, key.x, key.y);
    }

    public EncodeBase58(): string {
        // version keytype xlen x ylen y hash
        let writer = new BinaryReaderWriter();

        writer.AddByte(this.version);
        writer.AddBytes(Uint8ArrayFromHex(this.keytype.toString()));
        writer.AddUInt16(this.x.length);
        writer.AddBytes(this.x);
        writer.AddUInt16(this.y.length);
        writer.AddBytes(this.y);
        writer.AddBytes(this.hash);

        return base58.encodeFromBuffer(new Buffer(writer.ToArray()));
    }

    public ToHexString(): string {
        // version keytype xlen x ylen y hash
        let writer = new BinaryReaderWriter();

        // writer.AddByte(this.version);
        writer.AddBytes(Uint8ArrayFromHex(this.keytype.toString()));
        writer.AddUInt16(this.x.length);
        writer.AddBytes(this.x);
        writer.AddUInt16(this.y.length);
        writer.AddBytes(this.y);
        // writer.AddBytes(this.hash);

        return Uint8ArrayToHex(writer.ToArray());
    }

    public CalcHash(): Uint8Array {
        // keytype xlen x ylen y
        let writer = new BinaryReaderWriter();

        writer.AddBytes(Uint8ArrayFromHex(this.keytype.toString()));
        writer.AddUInt16(this.x.length);
        writer.AddBytes(this.x);
        writer.AddUInt16(this.y.length);
        writer.AddBytes(this.y);

        return Hash.SHA256(writer.ToArray()).slice(0, 4);
    }

    public IsValid(): boolean {
        let hash = this.CalcHash();
        return this.hash.every((v, i) => v === hash[i]);
    }
}


export function CreatePrivateKeyFromPasclWalletExport(
    privateEncryptedKeyHexString: string,
    password: string): { privateKey: Uint8Array, keytype: eKeyTypes } {

    let salt: Buffer | null = null;
    let passwordBuffer: Uint8Array = Buffer.from(password);
    let index: number = 0;
    var key: { key: Uint8Array, iv: Uint8Array };

    // check for Salted__
    if (privateEncryptedKeyHexString.startsWith("53616C7465645F5F")) {
        salt = new Buffer(privateEncryptedKeyHexString.slice(16, 16 + 16), "hex");
        index += 32;
        key = Kdf.Kdf_PascalCoin(passwordBuffer, salt);
    } else {
        key = Kdf.Kdf_PascalCoin(passwordBuffer);
    }

    // decrypt
    let encData: Uint8Array = new Uint8Array( Buffer.from(privateEncryptedKeyHexString.slice(index), "hex"));
    let output: Uint8Array = Aes.Decrypt_AES_CBC_PKCS7(key.key, key.iv, encData);

    let keytype: eKeyTypes = <eKeyTypes>Uint8ArrayToHex(output.slice(0, 2));
    let privateKey: Uint8Array = output.slice(4);
    // output[2] / output[3] ==> keylen
    return { privateKey, keytype };
}

export function CalcAccountChecksum(accNumber: number): number {
    return (accNumber * 101) % 89 + 10;
}