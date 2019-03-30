<template>
  <div class="md-layout">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        LoginRequestFrom: {{callback}}
        <br>
        For: {{this.account ? this.account.AccountName : ''}} [ {{accountid}} ]
        <br>

        <br>
        {{error}}
        <br>

        <br>
        <v-text-field type="password" v-model="password"/>
        <v-btn block @click="login" :disabled="this.account=== undefined">Continue</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import store from "@/KTech/store/store";

import {
  EcCrypto,
  KtlWallet,
  Uint8ArrayFromHex,
  Uint8ArrayToHex
} from "@/KTechLib/KTechLib";
import { open } from "fs";

@Component
export default class LoginForm extends Vue {
  accountid!: number;
  wallet: KtlWallet | undefined = undefined;
  challenge!: Uint8Array;
  publicEncryptionKey!: Uint8Array;
  callback!: string;
  password: string = "";
  error!: string;
  created() {
    this.accountid = Number.parseInt(this.$route.query["accountid"] as string);
    this.challenge = Uint8ArrayFromHex(this.$route.query[
      "challenge"
    ] as string);
    this.publicEncryptionKey = Uint8ArrayFromHex(this.$route.query[
      "publickey"
    ] as string);
    this.callback = this.$route.query["callback"] as string;

    if (
      !store.WalletManager.GetWalletNames().find(v => {
        this.wallet = store.WalletManager.GetWalletByName(v);
        if (this.wallet!.AccountNumber == this.accountid) {
          return true;
        }
        return false;
      })
    ) {
      this.wallet = undefined;
      this.error = "no Account found with ID:" + this.accountid;
      return;
    }
  }

  login() {
    this.error = "";
    if (!this.wallet) {
      this.error = "wallet === null";
      return;
    }
    let answer = store.KeyManager.ECDHDecrypt(
      this.wallet.PublicKey,
      this.challenge,
      this.publicEncryptionKey
    );

    var win = window.open(
      this.callback +
        "?accountid=" +
        this.accountid +
        "&answer=" +
        Uint8ArrayToHex(answer),
      "_blank"
    );
    //open(this.callback + answer,0,()=>0);
  }
}
</script>

