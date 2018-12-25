
import { eKeyTypes } from '../KtlCrypto';
import * as helper from '../Helper';
import { CreatePrivateKeyFromPasclWalletExport, PascalPublicKey } from './PascalCoin';






// password exportedkey privatekey publickey
let Testdata =
    [
        [
            eKeyTypes.SECP256K1,
            "test",
            "53616C7465645F5F62ED38F8DFB821A4222E87F5F6EF2C18F1F36747FBF354CDE4DA252F170306E28DE6B97D4AA1A6D0C14FC52" +
            "F4486ECEE19956F00D4668FB3",
            "012760234450B1DAAFF23E179E59E07F4FBE30670E83ABE5794AE2EE8814CFBA",
            "3Ghhbojn7gpYMHxz8nyUZei6hKsdjczjqtBVC5VpUMu7snV7jDnnc1Hi4rRVKu2voKHZ52m6SYdNuixuKkyWs4NeDzWCdiD4QHyFwe"
        ],
        [
            eKeyTypes.SECP384R1,
            "test",
            "53616C7465645F5FFB2CAD97B0859201F4A61D594FF59D7143A928F56DCB319912A1799B6AEC4027A1956AF11A157D88" +
            "F17E8483D3EE6D15FB0388A4FD08DECEAC8EAE0C6F37A530615E646EFE58485C",
            "C24B89BC292A06CC33FA8B29EA2740B14C248941022B2791E77AA1778F4DD0307916F71AB7B5ECED9CF9B593B27860E8",
            "gD8AW3DWRy8r8SeqNHRi7xPa7U2jrqwK9CqU49tpMeMFDbAYkt4vBoRBMiQdSWcM616wYn85mBX35CWvNemSTDQ5rnmudimH" +
            "ALG9KFb9umC5tDbjj5mBu2JrmLTdBwU2KJfXax32bfn6Djc5Q"
        ],
        [
            eKeyTypes.SECP521R1,
            "test",
            "53616C7465645F5F52BE39C494F7DA8E3623A0ACE0BD5442FDA3BB16F17D49425A72F4198040D24310602C53A5FB52004" +
            "099553267CCC949096619632A5FD6AE1710A740C1BBAED8283A83216388FE5ADCB53CCC2D7620AE705CCF887854E831",
            "01C007D23FB9D51190B55269FC3788E2C289659FFE45DBB273E7834FC0E6F14C2398E9994AC1F661D1EF4BD91A50D6410" +
            "75DA187F1178339A434E6F253460C67A533",
            "2KPEUbfDo29ybCH6GUnwG2UsmSNfY4YuWNEDVasHXZvb2FHv68t4KJBa298HuE2i3QZ6QfrraDviNkXN1qJkhWNuniqCmoKUnR" +
            "4M8zqXTPtqGfn3ebcT7zSjAygRqELyzMvUm1CKGz9farSgtJ8tjzpEPXsr1226cW5PPxGhqymGccaEryxLpTHWWDfASrjpaYU"
        ],
        /*   [
             KeyTypes.SECT283K1 ,
             "test",
             "53616C7465645F5F70C982E99FDBA2B2D7D239A10AC33019005BA949E24F8BAB3DC0409A7"+
             "B5802CA250EF3C6B71AC0BFD142EA8C5E2AB88869CB872C7E2B0B91"
              "01938F2FB08154DFFAF7A3399B65E5125B528A911E940C8EF251B61859E64B5E1054D722",
              "2jR5AN5uFghTZYnQ7E1CUFVnNGzHfYVU9hywDb8RGGWXPQUedUAbupEYxNnJFryZwnGDGyTMXMuwckJpGb5NFh8emnHT4pBW3iZ7sxi5bYzE5DV7y"
          ], */


    ];

describe.each(Testdata)("CheckKeyPairs %s",
    (keytype: eKeyTypes, password: string, encryptedprivatekey: string, privateKeyHexString: string, publicKeyBase58: string) => {
        privateKeyHexString = privateKeyHexString.toLowerCase();
        let pk: Uint8Array;
        it("keyIport", () => {
            let key = CreatePrivateKeyFromPasclWalletExport(encryptedprivatekey, password);
            expect(helper.Uint8ArrayToHex(key.privateKey)).toBe(privateKeyHexString);
            expect(key.keytype).toBe(keytype);
            pk = key.privateKey;
        });

        it("Public from encoedPublickey", () => {
            let publicKey: PascalPublicKey | null = PascalPublicKey.CreateFromBase58Key(publicKeyBase58);

            if (!publicKey) {
                expect(publicKey).not.toBe(null);
                return;
            }
            expect(publicKey.IsValid()).toBe(true);
            expect(publicKey.keytype).toBe(keytype);
            expect(publicKey.EncodeBase58()).toBe(publicKeyBase58);
        });

        it("Public from priavte", () => {
            let publicKey = PascalPublicKey.CreateFromPrivateKey(keytype, pk);
            if (!publicKey) {
                expect(publicKey).not.toBe(null);
                return;
            }
            expect(publicKey.IsValid()).toBe(true);
            expect(publicKey.keytype).toBe(keytype);
            expect(publicKey.EncodeBase58()).toBe(publicKeyBase58);
        });


    });








