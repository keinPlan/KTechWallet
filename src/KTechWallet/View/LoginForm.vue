<template>
  <div class="md-layout">
    <v-card>
      <v-card-title></v-card-title>
      <v-card-text>
        LoginRequestFrom: {{callback}}
        <br>
        For: {{this.account ? this.account.AccountName : ''}} [ {{accountid}} ]  <br>
      
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
import store from "../store/store";

import {
  EcCrypto,
  KtlAccount,
  Uint8ArrayFromHex,
  Uint8ArrayToHex
} from "@/KTechLib/KTechLib";
import { open } from "fs";

@Component
export default class LoginForm extends Vue {
  accountid!: number;
  account: KtlAccount | undefined = undefined;
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
      !store.AccountManager.GetAccountNames().find(v => {
        this.account = store.AccountManager.GetAccountByName(v);
        if (this.account!.AccountData.AccountNumber == this.accountid) {
          return true;
        }
        return false;
      })
    ) {
      this.account = undefined;
      this.error = "no Account found with ID:" + this.accountid;
      return;
    }
  }

  login() {
      this.error = "";
    let pk = this.account!.AccountData.EncryptedPrivateKey;
    let publicKey = pk.GetPublicKey(this.account!.AccountData.KeyType, this.password);

    if (publicKey.EncodeBase58() !== this.account!.AccountData.AccountPublicKey){
        this.error = "wrong password";
        return;
    }
 

    let answer = pk.ECDHDecrypt(
      this.account!.AccountData.KeyType,
      this.password,
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

