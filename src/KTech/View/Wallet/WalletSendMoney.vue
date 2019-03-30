<template>
  <v-layout align-space-around justify-space-around wrap row>
    <v-flex xs12 v-if="Label != ''">
      <v-card color="accent">
        <v-card-title class="pb-0 mb-0">
          <h2>InfoMessage:</h2>
        </v-card-title>
        <v-card-text class="pt-0 mt-0">
          <v-textarea flat auto-grow rows="1" :value="Label" readonly/>
        </v-card-text>
      </v-card>
    </v-flex>

    <!-- From: -->
    <v-flex xs12 md6>
      <v-card>
        <v-responsive>
          <v-toolbar class="headline mb-0">From:</v-toolbar>
        </v-responsive>
        <v-card-text>
          <v-select v-model="WalletName" :items="WalletNames" box label="Sender"></v-select>
          <v-layout row wrap>
            <v-text-field
              v-model="Amount"
              label="Amount"
              type="number"
              prefix="$"
              required
              :disabled="LockInputs"
            />
            <v-text-field v-model="Fee" label="Fee" type="number" prefix="$" required/>
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <!-- To: -->
    <v-flex xs12 md6>
      <v-card>
        <v-responsive>
          <v-toolbar class="headline mb-0">To:
            <v-spacer/>
            <v-btn-toggle v-model="ToContact" mandatory>
              <v-btn  flat :value="true" :disabled="LockInputs">Contact</v-btn>
              <v-btn  flat :value="false" :disabled="LockInputs">Account</v-btn>
            </v-btn-toggle>
          </v-toolbar>
        </v-responsive>
        <v-card-text>
          <v-combobox
            box
            v-show="ToContact"
            v-model="SelectedContact"
            :items="ContactNames"
            label="Select contact"
            @change="ContactChanged"
            :disabled="LockInputs"
          ></v-combobox>
          <v-layout row wrap>
            <v-text-field
              v-model="TargetAccountNumber"
              type="number"
              label="account number"
              placeholder="xxxxxxxx"
              required
              v-show="!ToContact"
              :disabled="LockInputs"
            />
            <v-text-field
              style="width:50px"
              v-model="TargetAccountNumberCheckSum"
              placeholder="xx"
              label="CheckSum"
              type="number"
              mask="##"
              required
              v-show="!ToContact"
              :disabled="LockInputs"
            />
          </v-layout>
        </v-card-text>
      </v-card>
    </v-flex>
    <!--   Payload -->
    <v-flex xs12>
      <v-card>
        <v-responsive>
          <v-toolbar>
            <h3 class="headline mb-0">Payload:</h3>
            <v-spacer/>
            <v-btn
              icon
              color="accent"
              @click="PayloadAktivated=!PayloadAktivated"
              :disabled="LockInputs"
            >
              <v-icon>{{PayloadAktivated ? 'remove_circle':'add_circle'}}</v-icon>
            </v-btn>
          </v-toolbar>
        </v-responsive>

        <v-card-text v-show="PayloadAktivated">
          <v-radio-group
            v-model="PayloadDisplay"
            @change="TogglePayload"
            row
            label="PayloadFromat:"
          >
            <v-radio label="hex" value="hex"></v-radio>
            <v-radio label="ascii" value="ascii"></v-radio>
          </v-radio-group>

          <v-radio-group
            row
            dense
            v-model="PayloadEncryption"
            label="PayloadEncryption:"
            :disabled="LockInputs"
          >
            <v-radio label="None" value="None"></v-radio>
            <v-radio label="KTECH_TARGETPUBLICKEY" value="KTECH_TARGETPUBLICKEY"></v-radio>
            <!--  <v-radio label="Password" value="3"></v-radio> -->
          </v-radio-group>

          <v-textarea
            box
            label="Payload:"
            v-model="Payload"
            :counter="PayloadMaxSize"
            auto-grow
            :disabled="LockInputs"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-flex>

    <!--  send -->
    <v-flex xs12>
      <v-card>
        <v-card-text>
          <v-alert :value="this.sendresult != ''" type="success">Sending was sucessful !!
            <v-textarea v-model="this.sendresult" auto-grow readonly/>
          </v-alert>
          <v-alert :value="this.errorMsg != ''" type="error">{{errorMsg}}</v-alert>
          <v-btn block color="accent" :loading="Processing" @click="OnSend">Send</v-btn>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import store from "@/KTech/store/store";
import { CalcAccountChecksum } from "@/KTechLib/PascalCoin/PascalCoin";
import {
  RpcGetAccount,
  RpcExecuteOperations,
  IGetAccountResponse
} from "@/KTechLib/PascalCoin/PascalCoinRpc";
import * as ktl from "@/KTechLib/KTechLib";


import { PascalCoinOpTransferMoney } from "@/KTechLib/PascalCoin/PascalCoinTransaction";
import { EcCrypto, eKeyTypes } from "@/KTechLib/KtlCrypto";
import {
  Uint8ArrayFromHex,
  Uint8ArrayToHex,
  BinaryReaderWriter
} from "@/KTechLib/Helper";
import {  } from "@/KTechLib/KtlKeyStorage";

@Component({})
export default class WalletSendMoney extends Vue {
  WalletNames: string[] = store.WalletManager.GetWalletNames();
  ContactNames: string[] = store.ContactsManager.GetAccountNames().concat(
    this.WalletNames.map(v => "#" + v)
  );
  PayloadAktivated: boolean = false;
  PayloadDisplay: string = "hex";
  PayloadEncryption: string = "None";
  PayloadMaxSize: number = 255 * 2;
  @Prop()  WalletName!: string;
  ToContact: boolean = true;
  SelectedContact!: string;
  Label: string = "";

  Amount: number = 0.0001;
  Fee: number = 0.0;
  TargetAccountNumber!: number;
  TargetAccountNumberCheckSum!: number;
  Payload: string = "";

  LockInputs: boolean = false;

  Processing: boolean = false;
  errorMsg: string = "";
  sendresult: string = "";

  mounted() {
    if (this.$route.query) {
      let target = this.$route.query["target"] as string;
      if (target) {
        this.ToContact = false;
        this.TargetAccountNumber = Number.parseInt(target);
        this.TargetAccountNumberCheckSum = Number.parseInt(
          target.slice(target.indexOf("-"), target.length)
        );
        this.LockInputs = true;
      }

      let label = this.$route.query["label"] as string;
      if (label) {
        this.Label = label;
      }

      let amount = Number.parseFloat(this.$route.query["amount"] as string);
      if (amount) {
        this.Amount = amount;
      }
      let payloadType = this.$route.query["payloaddisplay"] as string;
      let payload = this.$route.query["payload"] as string;

      if (payload) {
        this.Payload = payload;
        this.PayloadAktivated = true;
        this.PayloadDisplay = "hex";
        if (payloadType === "ascii") {
          this.PayloadDisplay = "ascii";
          this.TogglePayload();
        }
      }
    }
  }

  async OnSend() {
    try {
      // disable button
      this.sendresult = "";
      this.Processing = true;
      this.errorMsg = "";

      if (this.ToContact) {
        this.ContactChanged(); // force accnumber accchecksum update
        if (this.errorMsg != "") {
          return;
        }
      }

      if (this.Amount < 0.0001) {
        this.errorMsg = "min amount to send 0.0001";
        return;
      }

      let sender = store.WalletManager.GetWalletByName(this.WalletName);
      if (sender == null) {
        this.errorMsg = "No Wallet found with name: " + this.WalletName;
        return;
      }

      let accountDataFromBlockChain: IGetAccountResponse | null = null;

      await new RpcGetAccount(sender.AccountNumber)
        .Execute(store.WalletConfig.RpcServer)
        .then(v => (accountDataFromBlockChain = v))
        .catch(error => (this.errorMsg = JSON.stringify(error)));

      if (accountDataFromBlockChain == null || this.errorMsg != "") {
        return;
      }

      // check balance
      if (accountDataFromBlockChain!.balance < this.Amount + this.Fee) {
        this.errorMsg = "Account balance to low";
        return;
      }

      // check target crc
      let checksum = CalcAccountChecksum(this.TargetAccountNumber);

      if (this.TargetAccountNumberCheckSum.toString() !== checksum.toString()) {
        this.errorMsg =
          "TargetAccount checksum NOK!!" +
          this.TargetAccountNumberCheckSum +
          "  " +
          checksum;
        return;
      }

      let payloaddata = await this.GetPayload();

      // build transaction
      var trans = new PascalCoinOpTransferMoney(
        sender.AccountNumber,
        accountDataFromBlockChain!.n_operation + 1,
        this.Amount * 10000,
        this.Fee * 10000,
        payloaddata,
        this.TargetAccountNumber
      );

      // sign
      let sig = store.KeyManager.Sign(sender.PublicKey, trans.BuildOpHash());

      var data = trans.ToArray(sig.r, sig.s);

      var sendop = new RpcExecuteOperations("01000000" + Uint8ArrayToHex(data));

      await sendop.Execute(store.WalletConfig.RpcServer).then(v => {
        if (v[0] && !v[0].errors && v[0].valid !== false) {
          this.sendresult = JSON.stringify(v[0], null, 1);
        } else {
          this.errorMsg = "ERROR: ";
          this.errorMsg += v[0].errors
            ? v[0].errors
            : JSON.stringify(v[0], null, 1);
        }
      });
    } catch (error) {
      console.log(error);
      this.errorMsg = JSON.stringify(error);
    } finally {
      this.Processing = false;
    }
  }

  TogglePayload(): void {
    if (this.PayloadDisplay === "hex") {
      this.Payload = ktl.StringToHexString(this.Payload);
      this.PayloadMaxSize = 255 * 2;
    } else {
      this.Payload = ktl.HexStringToAsciiString(this.Payload);
      this.PayloadMaxSize = 255;
    }
  }

  async GetPayload(): Promise<Uint8Array> {
    if (!this.PayloadAktivated) {
      return new Uint8Array(0);
    }
    let hexString = "";

    if (this.PayloadDisplay !== "hex") {
      hexString = ktl.StringToHexString(this.Payload);
    } else {
      let len = this.Payload.length;
      this.Payload = this.Payload.replace(new RegExp("[^\\dabcdef]", "gi"), "");
      if (this.Payload.length != len) {
        throw "Some invalid characters where removed from payload Please check again !!!!";
      }

      hexString = this.Payload;
    }

    if (hexString.length % 2 != 0) {
      this.Payload = "0" + this.Payload;
    }

    if (hexString.length > 255 * 2) {
      throw "to much data in payload!!!";
    }

    if (this.PayloadEncryption === "KTECH_TARGETPUBLICKEY") {
      let accdata = await store.DataProvider.GetAccountInfo(
        this.TargetAccountNumber
      );

      let r = new BinaryReaderWriter(Uint8ArrayFromHex(accdata.enc_pubkey));
      let keytype: eKeyTypes = Uint8ArrayToHex(r.ReadBytes(2)) as eKeyTypes;
      let len = r.ReadUInt16();
      let x = r.ReadBytes(len);
      len = r.ReadUInt16();
      let y = r.ReadBytes(len);

      r.index = 0;
      r.AddByte(4);
      r.AddBytes(x);
      r.AddBytes(y);

      let data = ktl.EcCrypto.ECDHEncrypt(
        keytype,
        r.ToArray(),
        Uint8ArrayFromHex(hexString)
      );

      r = new BinaryReaderWriter();

      r.AddByte(data.publicKey.length / 2);
      r.AddByte(data.data.length);
      r.AddBytes(Uint8ArrayFromHex(data.publicKey));
      r.AddBytes(data.data);

      if (r.index > 255) {
        throw "Encrypted Payload to big => " + r.index;
      }
      return Promise.resolve(r.ToArray());
    }

    return Promise.resolve(Uint8ArrayFromHex(hexString));
  }

  ContactChanged() {
    if (this.SelectedContact.startsWith("#")) {
      let wallet = store.WalletManager.GetWalletByName(
        this.SelectedContact.substring(1)
      );

      if (wallet) {
        this.errorMsg = "";
        this.TargetAccountNumber = wallet.AccountNumber;
        this.TargetAccountNumberCheckSum = CalcAccountChecksum(wallet.AccountNumber);         
      } else {
        this.errorMsg = "selected account not valid";
      }
      return;
    }
    let contract = store.ContactsManager.GetAccountByName(this.SelectedContact);
    if (contract) {
      this.errorMsg = "";
      this.TargetAccountNumber = contract.ContactAccountNumber;
      this.TargetAccountNumberCheckSum = contract.ContactAccountNumberCheckSum;
    } else {
      this.errorMsg = "selected account not valid";
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

