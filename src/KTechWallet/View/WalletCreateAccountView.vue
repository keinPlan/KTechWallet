<template>
  <div>
    <v-stepper v-model="step">
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
          <v-text-field
            box
            color="deep-purple"
            counter="32"
            label="Password"
            style="min-height: 96px"
            type="password"
            v-model="privateKeyPassword"
          ></v-text-field>
          <v-textarea box label="PrivateKey" v-model="privateKey" auto-grow></v-textarea>
          <v-btn block color="accent" @click="NextStep">Continue</v-btn>
        </v-form>
      </v-stepper-content>

      <v-stepper-content step="3">
        <div>
          <v-card class="caption" color="primary">
            <v-card-text style="word-wrap: break-word">
              <h3 class="headline mb-0">keinPlan1337</h3>
              <br>
              <span class="font-weight-bold caption">CoinType:</span>PASCAL
              <br>
              <span class="font-weight-bold caption">AccountNumber:</span> 0123456789-xx
              <br>
              <span class="font-weight-bold caption">PublicKey:</span>
              <br>3Ghhbojn7gpYMHxz8nyUZei6hKsdjczjqtBVC5VpUMu7snV7jDnnc1Hi4rRVKu2voKHZ52m6SYdNuixuKkyWs4NeDzWCdiD4QHyFwe
            </v-card-text>
          </v-card>
        </div>

        <v-text-field
          box
          autofocus
          class="pt-5 ma-0"
          color="accent"
          label="Password"
          placeholder="Please Enter password to save privateKey"
          v-model="newPassword"
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
  KeyTypes,
  CreatePrivateKeyFromPasclWalletExport,
  GetAccount,
  PascalPublicKey,
  KtlAccountData,
  KtlKeyStorage,
  KtlAccount
} from "@/KTechLib/KTechLib";
import router from "@/KTechWallet/router";

@Component
export default class WalletCreateAccountView extends Vue {
  step: number = 1;
  ErrorMsg: string = "";

  coinTypes = [eCoinType.PASCAL, eCoinType.ETH];
  selectedCoinType: eCoinType = eCoinType.NONE;

  firstStep: boolean = false;
  secondStep: boolean = false;
  thirdStep: boolean = false;
  secondStepError!: string;

  accountName: string = "";
  coinType: eCoinType = eCoinType.PASCAL;
  newPassword: string = "";
  privateKey: string = "";
  privateKeyPassword: string = "";
  accountNumber: number = 118723;

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
        var key = CreatePrivateKeyFromPasclWalletExport(
          this.privateKey,
          this.privateKeyPassword
        );

        if (key.keytype === KeyTypes.INVALID) {
          this.ErrorMsg = "Password or keydata wrong";
          return;
        }

        var publickey = PascalPublicKey.CreateFromPrivateKey(
          key.keytype,
          key.privateKey
        );

        var rpc = new GetAccount(this.accountNumber);
        let result: boolean = false;
        var request = await rpc
          .Execute()
          .then(v => {
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
      }

      this.step++;
    } catch (error) {
      this.ErrorMsg = error;
    }
  }

  onSave() {
    let checkResult = true;

    if (!this.accountName) {
      checkResult = false;
    } else {
      if (store.AccountManager.GetAccountByName(this.accountName)) {
        // error accountname allready taken
        checkResult = false;
      }
    }
    console.log(this.newPassword);
    if (!this.newPassword) {
      // nop
      checkResult = false;
    }
    console.log(this.privateKey);
    if (!this.privateKey) {
      checkResult = false;
    }

    console.log(this.privateKeyPassword);
    if (!this.privateKeyPassword) {
      checkResult = false;
    }
    console.log(checkResult);
    if (!checkResult) return;
    // input ok checkkey

    let keydata = this.privateKey;
    if (keydata.length % 2 !== 0) {
      keydata = "0" + keydata;
    }

    let key = CreatePrivateKeyFromPasclWalletExport(
      keydata,
      this.privateKeyPassword
    );
    
    let publickey = PascalPublicKey.CreateFromPrivateKey(
      key.keytype,
      key.privateKey
    );

    if (!publickey.IsValid()) {
      throw "publickey !Valid";
    }

    let accData = new KtlAccountData(
      eCoinType.PASCAL,
      this.accountNumber,
      key.keytype,
      publickey.EncodeBase58(),
      KtlKeyStorage.CreateFromRawKey(key.privateKey, this.newPassword)
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

