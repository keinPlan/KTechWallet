<template>
  <v-dialog max-width="400px" persistent v-model="Show">
    <v-card>
      <v-responsive>
        <v-toolbar>
          <h2>Create New Wallet</h2>    
        </v-toolbar>
      </v-responsive>
      <v-card-text>
        <v-form ref="validation" lazy-validation>
          <v-text-field box v-model="walletName" :rules="nameRules" label="WalletName"/>
          <v-radio-group v-model="selectedCoinType" :mandatory="true" v-if="false">
            <v-radio label="PASCAL" value="PASCAL"></v-radio>
            <v-radio label="ETH" value="ETH" disabled></v-radio>
          </v-radio-group>

          <v-text-field         
            box
            label="AccountNumber"
            type="number"
            v-model="accountNumber"
            :rules="accountNumberRules"
          ></v-text-field>

          <v-btn block color="accent" @click="AddWallet" :loading="loading">Add Wallet</v-btn>
          <v-btn block color="primary" @click="$emit('Show',false)" :loading="loading">Close</v-btn>

          <v-alert :value="this.ErrorMsg != ''" type="error">
            <div v-html="ErrorMsg" style="word-break: break-all"></div>
          </v-alert>

          <v-alert :value="this.SuccessMsg != ''" type="success">
            <div v-html="SuccessMsg" style="word-break: break-all"></div>
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Provide,
  Vue,
  Model,
  Emit
} from "vue-property-decorator";

import store from "../store/store";

import {
  KtlStorageDummy,
  KtlStorageWindowLocalStorage,
  eCoinType,
  eKeyTypes,
  CreatePrivateKeyFromPasclWalletExport,
  RpcGetAccount,
  PascalPublicKey,
  KtlWallet,
  EcCrypto
} from "@/KTechLib/KTechLib";
import router from "@/KTech/router";

@Component
export default class WalletCreateAccount extends Vue {
  ErrorMsg: string = "";
  SuccessMsg: string = "";

  walletName: string = "";
  coinType: eCoinType = eCoinType.PASCAL;
  accountNumber: number = -1;
  ignoreError = false;
  loading: boolean = false;
  @Model("Show") Show: boolean = false;

  nameRules = [
    (v: string) => !!v || "Name is required",
    (v: string) => {
      if (store.WalletManager.GetWalletByName(v)) {
        return "account name allready in use ";
      }
      if (v.indexOf("#") !== -1) {
        return "'#' not allowed !!!";
      }
      return true;
    }
  ];

  accountNumberRules = [
    (v: number) =>
      v > 0xffffffff
        ? "accountnumber to big"
        : v < 0
        ? "accountnumber to small "
        : true,
    (v: number) => !!v || "accountNumber is required"
  ];

  AddWallet() {
    this.ErrorMsg = this.SuccessMsg = "";

    var rpc = new RpcGetAccount(this.accountNumber);

    if (!(this.$refs.validation as any).validate()) {
      return;
    }

    this.loading = true;
    rpc
      .Execute(store.WalletConfig.RpcServer)
      .then(v => {
        let publicKey: PascalPublicKey = PascalPublicKey.CreateFromEncPublicKey(
          v.enc_pubkey
        );

        let publicKeyB58 = publicKey.EncodeBase58();

        store.WalletManager.AddWallet(
          new KtlWallet(
            this.walletName,
            eCoinType.PASCAL,
            this.accountNumber,
            publicKeyB58,
            0
          )
        );

        this.SuccessMsg = "Account added <br>" + publicKeyB58;
      })
      .catch(error => {
        this.ErrorMsg = "Error: " + JSON.stringify(error);
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

