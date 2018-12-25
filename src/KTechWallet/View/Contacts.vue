<template>
  <div>
    <v-card><h1>TODO</h1>
   
    </v-card>
    <v-layout align-center justify-center wrap row>
      <v-card width="350px">
        <v-card-title>
          <div>
            <h3 class="headline mb-0">KTechDev</h3>606554-60
            <br>
          </div>
          <v-spacer/>
          <div>
            <v-chip class="font-weight-bold title" label>0.00000
              <v-icon right color="accent">attach_money</v-icon>
            </v-chip>
          </div>
        </v-card-title>

        <v-toolbar flat>
          <v-btn icon color="accent" v-show="false">
            <v-icon>notification_important</v-icon>
          </v-btn>
          <v-btn icon color="error" v-show="false">
            <v-icon>warning</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>delete</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>info</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>send</v-icon>
          </v-btn>
          <v-btn icon @click="Update" :loading="autorenew_loading">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
      <v-card width="350px">
        <v-card-title>
          <div>
            <h3 class="headline mb-0">PascalCoin Foundation Limited</h3>123123123-xx
            <br>
          </div>
          <v-spacer/>
          <div>
            <v-chip class="font-weight-bold title" label>0.00000
              <v-icon right color="accent">attach_money</v-icon>
            </v-chip>
          </div>
        </v-card-title>

        <v-toolbar flat>
          <v-btn icon color="accent" v-show="false">
            <v-icon>notification_important</v-icon>
          </v-btn>
          <v-btn icon color="error" v-show="false">
            <v-icon>warning</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>delete</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>info</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>send</v-icon>
          </v-btn>
          <v-btn icon @click="Update" :loading="autorenew_loading">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>

      <v-btn @click="test2" block>test</v-btn>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import { Hash, Kdf, KeyTypes, EcCrypto, Aes } from "@/KTechLib/KtlCrypto";
import * as helper from "@/KTechLib/Helper";
import {
  CreatePrivateKeyFromPasclWalletExport,
  PascalPublicKey
} from "@/KTechLib/PascalCoin/PascalCoin";
import * as mipher from "mipher";
import { BinaryReaderWriter } from "@/KTechLib/Helper";
import { PascalCoinTransaction } from "@/KTechLib/PascalCoin/PascalCoinTransaction";
import {
  CreateOperation,
  ICreateOperationResponse
} from "@/KTechLib/PascalCoin/PascalCoinRpc";

@Component({})
export default class Contacts extends Vue {
  async test() {
    var pk = mipher.Convert.hex2bin(
      "012760234450B1DAAFF23E179E59E07F4FBE30670E83ABE5794AE2EE8814CFBA"
    );
    var gg = PascalPublicKey.CreateFromPrivateKey(KeyTypes.SECP256K1, pk);

    var testop = new CreateOperation(
      0x12345678,
      0xafffffff,
      "3Ghhbojn7gpYMHxz8nyUZei6hKsdjczjqtBVC5VpUMu7snV7jDnnc1Hi4rRVKu2voKHZ52m6SYdNuixuKkyWs4NeDzWCdiD4QHyFwe",
      "3Ghhbojn7gpYMHxz8nyUZei6hKsdjczjqtBVC5VpUMu7snV7jDnnc1Hi4rRVKu2voKHZ52m6SYdNuixuKkyWs4NeDzWCdiD4QHyFwe",
      0x66666666,
      10.5,
      1,
      "30303030",
      "none",
      "test",
      ""
    );
    let data: ICreateOperationResponse | null = null;
    await testop.Execute().then(v => (data = v));
    if (data === null) return;
    console.log(data);
    var br = new BinaryReaderWriter(
      mipher.Convert.hex2bin(data!.rawoperations)
    );

    let x1: number = br.ReadUInt32(); // amount ?
    let x2: number = br.ReadUInt32(); // opType
    let x3: number = br.ReadUInt32(); // sender
    let x4: number = br.ReadUInt32(); // Sender_OperationCounter
    let x5: number = br.ReadUInt32(); // target
    let x6: number = br.ReadUInt64(); // amount
    let x7: number = br.ReadUInt64(); // fee
    let x8: number = br.ReadUInt16(); // plyload
    let x9 = br.ReadBytes(x8);
    let publickey = br.ReadBytes(6);
    let x10: number = br.ReadUInt16(); // R
    let x11 = br.ReadBytes(x10);
    let x12: number = br.ReadUInt16(); // s
    let x13 = br.ReadBytes(x12);

    let ttt = new PascalCoinTransaction(x2, x3, x4, x6, x7, x9, x5);
    console.log(ttt);
    let hash = ttt.BuildOpHash();

    var pk = mipher.Convert.hex2bin(
      "012760234450B1DAAFF23E179E59E07F4FBE30670E83ABE5794AE2EE8814CFBA"
    );
    var gg = PascalPublicKey.CreateFromPrivateKey(KeyTypes.SECP256K1, pk);

    console.log(EcCrypto.CheckSig(gg.keytype, pk, hash, x11, x13));
  }



   async test2() {
    var pk = mipher.Convert.hex2bin(
       "01C007D23FB9D51190B55269FC3788E2C289659FFE45DBB273E7834FC0E6F14C2398E9994AC1F661D1EF4BD91A50D6410" +
            "75DA187F1178339A434E6F253460C67A533",
    );
    var gg = PascalPublicKey.CreateFromPrivateKey(KeyTypes.SECP256K1, pk);

    var testop = new CreateOperation(
      0x12345678,
      0xafffffff,
        "4vQZtSjosPbqNDUb4agHqmPt78YxHWDhMcxxw9mMVaVEHtkgLE9WCA9ntmqQFNtBNz26JtuaCbJG3sE6btBPmJMJoxrFVpmMwXK49ptybL6twbEJXQqdFKxrAp6ED2YDyNwrk945Na46CmXx7x6eRY8MEC4pcDxaJmFPCJTgkibQ1JbmZ6K9PN9G62c7zHqv",
        "4vQZtSjosPbqNDUb4agHqmPt78YxHWDhMcxxw9mMVaVEHtkgLE9WCA9ntmqQFNtBNz26JtuaCbJG3sE6btBPmJMJoxrFVpmMwXK49ptybL6twbEJXQqdFKxrAp6ED2YDyNwrk945Na46CmXx7x6eRY8MEC4pcDxaJmFPCJTgkibQ1JbmZ6K9PN9G62c7zHqv" ,
      0x66666666,
      10.5,
      1,
      "30303030",
      "none",
      "test",
      ""
    );
    let data: ICreateOperationResponse | null = null;
    await testop.Execute().then(v => (data = v));
    if (data === null) return;
    console.log(data);
    var br = new BinaryReaderWriter(
      mipher.Convert.hex2bin(data!.rawoperations)
    );

    let x1: number = br.ReadUInt32(); // amount ?
    let x2: number = br.ReadUInt32(); // opType
    let x3: number = br.ReadUInt32(); // sender
    let x4: number = br.ReadUInt32(); // Sender_OperationCounter
    let x5: number = br.ReadUInt32(); // target
    let x6: number = br.ReadUInt64(); // amount
    let x7: number = br.ReadUInt64(); // fee
    let x8: number = br.ReadUInt16(); // plyload
    let x9 = br.ReadBytes(x8);
    let publickey = br.ReadBytes(6);
    let x10: number = br.ReadUInt16(); // R
    let x11 = br.ReadBytes(x10);
    let x12: number = br.ReadUInt16(); // s
    let x13 = br.ReadBytes(x12);

    let ttt = new PascalCoinTransaction(x2, x3, x4, x6, x7, x9, x5);
    console.log(ttt);
    let hash = ttt.BuildOpHash();

    var pk = mipher.Convert.hex2bin(
      "01C007D23FB9D51190B55269FC3788E2C289659FFE45DBB273E7834FC0E6F14C2398E9994AC1F661D1EF4BD91A50D6410" +
            "75DA187F1178339A434E6F253460C67A533",
    );
    var gg = PascalPublicKey.CreateFromPrivateKey(KeyTypes.SECP256K1, pk);

    console.log(EcCrypto.CheckSig(gg.keytype, pk, hash, x11, x13));
  }

  async test3() {
    // var x =  navigator as any;
    //x.registerProtocolHandler(    'web+mystuff', 'http://192.168.2.105:8080/%s', 'My App');
    var pk = mipher.Convert.hex2bin("01aaaaabbaabbaaaaaaa");
    var gg = PascalPublicKey.CreateFromPrivateKey(KeyTypes.SECP521R1, pk);

    let data = new Uint8Array(32).fill(0);

    console.log(pk);

    let sig = EcCrypto.sign(KeyTypes.SECP521R1, pk, data);

    console.log(sig);
    console.log(EcCrypto.CheckSig(KeyTypes.SECP521R1, pk, data, sig.r, sig.s));
  }

  test4() {
    let data = new Uint8Array(32);
    let data2 = new Uint8Array(453);
    let enc = Aes.Encrypt_AES(data, data2);
    let dec = Aes.Decrypt_AES(data, enc);
    console.log(dec);
  }
}
</script>

 

