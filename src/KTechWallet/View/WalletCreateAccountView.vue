<template>
  <div>
    <v-stepper v-model="step" lazy>
      <v-stepper-header>
        <v-stepper-step step="1">Select Name</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="2">AccountData</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step step="3">Save</v-stepper-step>
      </v-stepper-header>

      <v-stepper-content step="1">
        <v-form ref="accountNameForm">
          <v-text-field v-model="accountName" :rules="nameRules" label="Name" required/>
          <v-radio-group v-model="selectedCoinType" :mandatory="true" v-if="false">
            <v-radio label="PASCAL" value="PASCAL"></v-radio>
            <v-radio label="ETH" value="ETH" disabled></v-radio>
          </v-radio-group>

          <v-btn block color="accent" @click="NextStep">Continue</v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-form ref="keyImportForm">
          <v-text-field
            box
            color="deep-purple"
            label="AccountNumber"
            type="number"
            v-model="accountNumber"
          ></v-text-field>

          <v-card class="pa-0 ma-0">
            <v-responsive>
              <v-toolbar>
                <h2>PrivateKey:</h2>
              </v-toolbar>

              <v-btn-toggle v-model="ImportType" class="mt-1">
                <v-btn color="accent" flat value="pascexport">pascexport</v-btn>
                <v-btn color="accent" flat value="newkey">newkey</v-btn>
              </v-btn-toggle>
            </v-responsive>

            <v-card-text v-show="this.ImportType === 'pascexport'">
              <v-text-field
                box
                color="deep-purple"
                counter="32"
                label="Password"
                style="min-height: 96px"
                type="password"
                v-model="Pascexport_Password"
              ></v-text-field>
              <v-textarea box label="ExportedData" v-model="Pascexport_KeyData" auto-grow></v-textarea>
            </v-card-text>

            <v-card-text v-show="this.ImportType === 'newkey'">
              <v-radio-group v-model="KeyType" label="KeyType:">
                <v-radio label="secp256k1" value="ca02"></v-radio>
                <v-radio label="sect283k1" value="d902" disabled></v-radio>
                <v-radio label="sect384r1" value="cb02"></v-radio>
                <v-radio label="sect521r1" value="cc02"></v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>

          <v-btn block color="accent" @click="NextStep">Continue</v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-content step="3">
        <div>
          <v-card class="caption" color="primary">
            <v-card-text style="word-wrap: break-word">
              <h3 class="headline mb-0">{{accountName}}</h3>
              <br>
              <span class="font-weight-bold caption">CoinType:</span>
              {{coinType}}
              <br>
              <span class="font-weight-bold caption">AccountNumber:</span>
              {{accountNumber}}
              <br>
              <span class="font-weight-bold caption">KeyType:</span>
              {{KeyType}}
              <br>

              <span class="font-weight-bold caption">PublicKey:</span>
              <br>
              {{PublicKeyB58}}
            </v-card-text>
          </v-card>
        </div>

        <v-text-field
          box
          class="pt-5 ma-0"
          color="accent"
          label="Password"
          placeholder="Please Enter password to save privateKey"
          v-model="newPassword"
          type="password"
        ></v-text-field>
        <v-text-field
          box
          color="accent"
          label="Password"
          placeholder="repeat password"
          v-model="newPassword2"
          type="password"
        ></v-text-field>
        <v-btn
          block
          class="pt-0 ma-0"
          color="accent"
          v-bind:disabled="this.newPassword.length === 0"
          @click="onSave"
        >Save</v-btn>
      </v-stepper-content>
    </v-stepper>

    <v-alert :value="this.ErrorMsg.length > 0" type="error">{{ErrorMsg}}</v-alert>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import WalletInfo from "@/KTechWallet/Component/WalletInfo.vue";
import store from "../store/store";

import {
  KtlStorageDummy,
  KtlStorageWindowLocalStorage,
  eCoinType,
  eKeyTypes,
  CreatePrivateKeyFromPasclWalletExport,
  RpcGetAccount,
  PascalPublicKey,
  KtlAccountData,
  KtlKeyStorage,
  KtlAccount,
  EcCrypto
} from "@/KTechLib/KTechLib";
import router from "@/KTechWallet/router";

@Component
export default class WalletCreateAccountView extends Vue {
  step: number = 1;
  ErrorMsg: string = "";

  coinTypes = [eCoinType.PASCAL, eCoinType.ETH];
  selectedCoinType: eCoinType = eCoinType.NONE;
  lastupdate: number = 0;

  firstStep: boolean = false;
  secondStep: boolean = false;
  thirdStep: boolean = false;
  secondStepError!: string;

  accountName: string = "";
  coinType: eCoinType = eCoinType.PASCAL;
  newPassword: string = "";
  newPassword2: string = "";
  Pascexport_KeyData: string = "";
  Pascexport_Password: string = "";
  accountNumber: number = 118723;

  ImportType: string = "newkey";
  KeyType: eKeyTypes = eKeyTypes.SECP256K1;
  PublicKeyB58: string = "";
  RawPrivateKey: Uint8Array = new Uint8Array();

  nameRules = [
    (v: string) => !!v || "Name is required",
    (v: string) => {
      console.log(v);
      if (store.AccountManager.GetAccountByName(v)) {
        return "account name allready in use ";
      }
      if (v.indexOf("#") !== -1) {
        return "'#' not allowed !!!";
      }
      return true;
    },
    (v: string) => v.length <= 10 || "Name must be less than 10 characters"
  ];

  async NextStep() {
    this.ErrorMsg = "";
    try {
      if (this.step === 1) {
        if (!(this.$refs.accountNameForm as any).validate()) {
          return;
        }
      } else if (this.step === 2) {
        if (this.ImportType === "pascexport") {
          if (this.Pascexport_KeyData.length % 2 !== 0) {
            this.Pascexport_KeyData = "0" + this.Pascexport_KeyData;
          }

          var key = CreatePrivateKeyFromPasclWalletExport(
            this.Pascexport_KeyData,
            this.Pascexport_Password
          );

          if (key.keytype === eKeyTypes.INVALID) {
            this.ErrorMsg = "Password or keydata wrong";
            return;
          }

          var publickey = PascalPublicKey.CreateFromPrivateKey(
            key.keytype,
            key.privateKey
          );

          this.PublicKeyB58 = publickey.EncodeBase58();
          this.RawPrivateKey = key.privateKey;
          this.KeyType = key.keytype;

          var rpc = new RpcGetAccount(this.accountNumber);
          let result: boolean = false;
          var request = await rpc
            .Execute()
            .then(v => {
              this.lastupdate = v.updated_b;
              if (publickey.ToHexString() !== v.enc_pubkey.toLowerCase()) {
                this.ErrorMsg =
                  "PublicKey from private: " +
                  publickey.ToHexString() +
                  "\nPublicKey from account: " +
                  v.enc_pubkey.toLowerCase();

                result = confirm(
                  "the accounts public key dosn't match the privatekey\nignore?"
                );
              } else {
                result = true;
              }
            })
            .catch(v => {
              result = confirm(
                "Failed to get accounts publickey: \n" +
                  v +
                  "\nignore and continue?"
              );
            });

          if (!result) {
            return;
          }
        } else if (this.ImportType === "newkey") {
          let keydata = EcCrypto.NewKeyPair(this.KeyType);
          let pubkey = new PascalPublicKey(
            1,
            this.KeyType,
            keydata.publicX,
            keydata.publicY
          );

          this.PublicKeyB58 = pubkey.EncodeBase58();
          this.RawPrivateKey = keydata.privateP;
        }
      }

      this.step++;
    } catch (error) {
      this.ErrorMsg = error;
    }
  }

  onSave() {
    this.ErrorMsg = "";
    let checkResult = true;

    if (!this.accountName) {
      checkResult = false;
    } else {
      if (store.AccountManager.GetAccountByName(this.accountName)) {
        // error accountname allready taken
        checkResult = false;
      }
    }

    if (!this.newPassword) {
      // nop
      checkResult = false;
    }

    if (this.newPassword !== this.newPassword2) {
      this.ErrorMsg = "passwords don't match";
      checkResult = false;
    }

    if (!this.RawPrivateKey || this.RawPrivateKey.length === 0) {
      checkResult = false;
    }

    if (!checkResult) return;
    // input ok checkkey

    let accData = new KtlAccountData(
      eCoinType.PASCAL,
      this.accountNumber,
      this.KeyType,
      this.PublicKeyB58,
      this.lastupdate,
      KtlKeyStorage.CreateFromRawKey(this.RawPrivateKey, this.newPassword)
    );

    let account = new KtlAccount(
      this.accountName,
      new KtlStorageWindowLocalStorage(),
      accData
    );

    store.AccountManager.AddAcount(account);
    router.back();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

