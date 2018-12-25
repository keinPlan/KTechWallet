<template>
  <v-layout align-space-around justify-space-around wrap row>
    <v-flex xs12 md6>
      <v-card>
        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">From:</h3>
          </div>
        </v-card-title>
        <v-card-text>
          <v-select v-model="AccountName" :items="AccountNames" box label="Sender"></v-select>
          <v-text-field v-model="Amount" label="Amount" type="number" prefix="$" required/>
          <v-text-field v-model="Fee" label="Fee" type="number" prefix="$" required/>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex xs12 md6>
      <v-card>
        <v-card-title primary-title>
          <div>
            <h3 class="headline mb-0">To:</h3>
          </div>
        </v-card-title>
        <v-card-text>
          <v-combobox :items="AccountNames" label="Select account "></v-combobox>
          <v-text-field
            v-model="TargetAccountNumber"
            placeholder="xxxxxx-xx"
            label="account number"
            required
          />
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-title class="pt-0 pb-0">
          <v-switch v-model="PayloadAktivated" label="Payload:"></v-switch>
          <h3 class="headline mb-0"></h3>
        </v-card-title>

        <v-card-text v-show="PayloadAktivated">
          <v-radio-group v-model="PayloadFormat" @change="TogglePayload" row>
            <v-radio label="hex" value="hex"></v-radio>
            <v-radio label="assci" value="assci"></v-radio>
          </v-radio-group>
          <!--       <v-switch dense label="PayloadEncryption"></v-switch>
    <v-radio-group row dense disabled>
            <v-radio label="TargetPublicKey" value="2"></v-radio>
            <v-radio label="Password" value="3"></v-radio>
          </v-radio-group>-->
          <v-textarea
            box
            label="Payload"
            v-model="Payload"
            :counter="PayloadFormat =='hex' ? 255*2:255 "
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs11>
      <v-text-field
        outline
        v-model="Password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'visibility_off' : 'visibility'"
        @click:append="showPassword = !showPassword"
        required
      />
      <v-alert :value="this.Error.length > 0" type="error">{{Error}}</v-alert>
      <v-btn block color="accent" :loading="Processing" @click="OnSend">Send</v-btn>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import store from "../store/store";
import { CalcAccountChecksum } from "@/KTechLib/PascalCoin/PascalCoin";
import {
  GetAccount,
  IGetAccountResponse,
  ExecuteOperations
} from "@/KTechLib/PascalCoin/PascalCoinRpc";
import { KtlAccount } from "@/KTechLib/KtlAccount";
import { PascalCoinTransaction } from "@/KTechLib/PascalCoin/PascalCoinTransaction";
import { EcCrypto } from "@/KTechLib/KtlCrypto";
import { Uint8ArrayFromHex, Uint8ArrayToHex } from "@/KTechLib/Helper";
import { KtlKeyStorage } from "@/KTechLib/KtlKeyStorage";

@Component({})
export default class WalletSendMoney extends Vue {
  showPassword: boolean = false;
  AccountNames: Array<string> = store.AccountManager.GetAccountNames();
  PayloadAktivated: boolean = false;
  PayloadFormat: string = "hex";
  @Prop() AccountName!: string;

  Amount: number = 0.0001;
  Fee: number = 0.0;
  TargetAccountNumber: string = "";
  Payload: string = "";
  Password: string = "";
  Error: string = "";
  Processing: boolean = false;

  constructor() {
    super();
  }

  async OnSend() {
    try {
      this.Error = "";
      // disable button
      this.Processing = true;

      let sender = store.AccountManager.GetAccountByName(this.AccountName);

      if (sender == null) {
        this.Error = "No Wallet found with name: " + this.AccountName;
        return;
      }

      let req = new GetAccount(sender.AccountData.AccountNumber);
      let rsp: IGetAccountResponse | null = null;
      await req
        .Execute()
        .then(v => {
          rsp = v;
        })
        .catch(err => {
          this.Error = "Request Accountdata failed !!!";
          rsp = null;
        });

      if (rsp == null) {
        return;
      }

      // check balance
      if (rsp!.balance < this.Amount) {
        this.Error = "Account balance to low";
        return;
      }

      // check target crc
      let temp = this.TargetAccountNumber.split("-");
      let targetAcc: number = Number.parseInt(temp[0]);
      let targetAccChecksum: number = Number.parseInt(temp[1]);
      let checksum = CalcAccountChecksum(targetAcc);

      if (targetAccChecksum !== checksum) {
        this.Error =
          "TargetAccount checksum NOK!!" + targetAccChecksum + "  " + checksum;
        return;
      }

      // build transaction
      var trans = new PascalCoinTransaction(
        1,
        sender.AccountData.AccountNumber,
        rsp!.n_operation + 1,
        this.Amount * 10000,
        this.Fee * 10000,
        this.GetPayload(),
        targetAcc
      );
      console.log(sender.AccountData.EncryptedPrivateKey as KtlKeyStorage);
      // sign
      var sig = sender.AccountData.EncryptedPrivateKey.Sign(
        this.Password,
        trans.BuildOpHash(),
        sender.AccountData.KeyType
      );
      console.log(sig);
      var data = trans.build(sig.r, sig.s);

      var sendop = new ExecuteOperations("01000000" + Uint8ArrayToHex(data));

      await sendop.Execute().then(v => {
        if (v[0].valid === undefined) {
          alert("Sending was OK !!!");
        } else {
          this.Error = v[0].errors;
        }
      });

      // send to rpc
    } catch (error) {
      console.log(error);
      this.Error = JSON.stringify(error);
    } finally {
      this.Processing = false;
    }
  }

  TogglePayload(): void {
    if (this.PayloadFormat === "hex") {
      var arr1 = [];
      for (var n = 0, l = this.Payload.length; n < l; n++) {
        var hex = Number(this.Payload.charCodeAt(n)).toString(16);
        arr1.push(hex);
      }
      this.Payload = arr1.join("");
    } else {
      var hex = this.Payload;
      this.Payload = "";
      for (var n = 0; n < hex.length; n += 2) {
        this.Payload += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
      }
    }
  }

  GetPayload(): Uint8Array {
    if (!this.PayloadAktivated) {
      return new Uint8Array(0);
    }

    if (this.PayloadFormat === "hex") {
      let len = this.Payload.length;
      this.Payload = this.Payload.replace(new RegExp("[^\\dabcdef]", "gi"), "");
      if (this.Payload.length != len) {
        throw "Some invalid characters where removed from payload Please check again !!!!";
      }
      if (len % 2 != 0) {
        this.Payload = "0" + this.Payload;
      }

      if (len > 255 * 2) {
        throw "to much data in payload!!!";
      }

      return Uint8ArrayFromHex(this.Payload);
    }

    return new TextEncoder().encode(this.Payload);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

