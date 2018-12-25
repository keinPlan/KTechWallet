import * as mipher from "mipher";
import * as  elliptic from "elliptic";

export enum KeyTypes {
    INVALID = "",
    SECP256K1 = "ca02", // 714
    SECP384R1 = "cb02", // 715
    SECP521R1 = "cc02", // 716
    SECT283K1 = "d902", // 729
}

export class EcCrypto {
    public static GetPublicKey_Raw(keyType: KeyTypes, privatePoint: Uint8Array): { x: Uint8Array, y: Uint8Array } {
        let curve = GetCurve(keyType);
        var key = curve.keyFromPrivate(Buffer.from(privatePoint));

        let x: Uint8Array = key.getPublic().getX().toArray();
        let y: Uint8Array = key.getPublic().getY().toArray();

        return { x, y };
    }

    public static sign(keyType: KeyTypes, privatePoint: Uint8Array, msg: Uint8Array): { r: Uint8Array, s: Uint8Array } {
        let curve = GetCurve(keyType);
        var key = curve.keyFromPrivate(Buffer.from(privatePoint));
        var sig = key.sign(Buffer.from(msg));

        return { r: Uint8Array.from(sig.r.toArray()), s: Uint8Array.from(sig.s.toArray()) };
    }

    public static CheckSig(keyType: KeyTypes, privatePoint: Uint8Array, data: Uint8Array, sigR: Uint8Array, sigS: Uint8Array): boolean {
        let curve = GetCurve(keyType);
        var key = curve.keyFromPrivate(Buffer.from(privatePoint.buffer));

        var sig: any = {
            r: Buffer.from(sigR.buffer),
            s: Buffer.from(sigS.buffer)
        };
        console.log(sig);
        return key.verify(Buffer.from(data.buffer), sig);
    }
}

function GetCurve(keyType: KeyTypes): elliptic.ec {
    switch (keyType) {
        case KeyTypes.SECP256K1:
            return new elliptic.ec("secp256k1");
            break;
        case KeyTypes.SECT283K1:
            throw "curve not supported"; //curve = new elliptic.ec("sect283k1");
        case KeyTypes.SECP384R1:
            return new elliptic.ec("p384");
            break;
        case KeyTypes.SECP521R1:
            return new elliptic.ec("p521");
            break;
        default:
            throw (keyType + " is not supported");
    }

}

export class Hash {
    public static SHA256(data1: Uint8Array, data2?: Uint8Array, data3?: Uint8Array): Uint8Array {
        var hasher = new mipher.SHA256();

        hasher.update(data1);
        if (data2) { hasher.update(data2); }
        if (data3) { hasher.update(data3); }

        return hasher.digest();
    }

    public static SHA256_string(data: string): Uint8Array {
        return new mipher.SHA256().hash(mipher.Convert.hex2bin(data));
    }

    public static SHA512(data1: Uint8Array, data2?: Uint8Array, data3?: Uint8Array): Uint8Array {
        var hasher = new mipher.SHA512();

        hasher.update(data1);
        if (data2) { hasher.update(data2); }
        if (data3) { hasher.update(data3); }

        return hasher.digest();
    }

}

export class Kdf {
    public static Kdf2_Sha512(password: string, slatSize: number): { key: Uint8Array, salt: Uint8Array } {
        let salt: Uint8Array = new mipher.Random().get(slatSize);
        let key = Kdf.Kdf2_Sha512_Salt(password, salt);

        return { key, salt };
    }

    public static Kdf2_Sha512_Salt(password: string, salt: Uint8Array): Uint8Array {
        let kdf = new mipher.PBKDF2(new mipher.HMAC(new mipher.SHA512()), 100);

        return kdf.hash(Buffer.from(password), salt);
    }

    public static Kdf_PascalCoin(password: Uint8Array, salt?: Uint8Array): { key: Uint8Array, iv: Uint8Array } {
        //Key = sha256 (password + salt);
        let key = Hash.SHA256(password, salt);
        //iv = sha256 (KEY + password + salt);
        let iv = Hash.SHA256(key, password, salt);
        return { key, iv };
        mipher.Convert.bin2hex
    }

}


export class Aes {
    public static Encrypt_AES_CBC_PKCS7(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
        let aes: mipher.AES_CBC_PKCS7 = new mipher.AES_CBC_PKCS7();
        return aes.encrypt(key, data, iv);
    }

    public static Decrypt_AES_CBC_PKCS7(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
        let aes: mipher.AES_CBC_PKCS7 = new mipher.AES_CBC_PKCS7();
        return aes.decrypt(key, data, iv);
    }

    public static Encrypt_AES(key: Uint8Array, data: Uint8Array): Uint8Array {
        let aes: mipher.AES_CBC_PKCS7 = new mipher.AES_CBC_PKCS7();
        return aes.encrypt(key, data, Hash.SHA256(key));
    }

    public static Decrypt_AES(key: Uint8Array, data: Uint8Array): Uint8Array {
        let aes: mipher.AES_CBC_PKCS7 = new mipher.AES_CBC_PKCS7();
        data = new Uint8Array(data);
        return aes.decrypt(key, data, Hash.SHA256(key));
    }
}