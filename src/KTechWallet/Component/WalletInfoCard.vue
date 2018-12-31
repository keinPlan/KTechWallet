
<template>
  <v-card v-if="this.Account">
    <v-card-title>
      <div>
        <h3 class="headline mb-0">{{AccountName}}</h3>
        {{ this.Account.AccountData.AccountNumber}}-{{AccountCheckSum}}
        <br>
      </div>
      <v-spacer/>
      <div>
        <v-chip class="font-weight-bold title" label>
          {{Balance}}
          <v-icon right color="accent">attach_money</v-icon>
        </v-chip>
      </div>
    </v-card-title>
    <v-alert :value="Error !== ''" v-html="Error"></v-alert>
    <v-toolbar flat>
      <v-spacer></v-spacer>
      <v-btn icon @click="DeleteWallet">
        <v-icon>delete</v-icon>
      </v-btn>

      <v-btn
        icon
        :to="{name:'walletdetails' ,params: { AccountName: this.AccountName } }"
        :color="(this.accountChanged ? 'accent':'')"
      >
        <v-icon>{{(this.accountChanged ? 'notification_important':'info')}}</v-icon>
      </v-btn>

      <v-btn icon :to="{ name:'walletsend' , params: { AccountName: this.AccountName }}">
        <v-icon>send</v-icon>
      </v-btn>
      <v-btn icon @click="Update(true)" :loading="autorenew_loading">
        <v-icon>autorenew</v-icon>
      </v-btn>
    </v-toolbar>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";

import {
  KtlAccountData,
  eCoinType,
  KtlKeyStorage,
  eKeyTypes,
  KtlAccount,
  KtlStorageWindowLocalStorage,
  CalcAccountChecksum,
  PascalPublicKey
} from "@/KTechLib/KTechLib";

@Component({})
export default class WalletInfoCard extends Vue {
  @Prop() public AccountName!: string;
  Account!: KtlAccount | undefined;
  Balance: string = "xxx.xx";
  lastupdate: string = "";
  autorenew_loading: boolean = false;
  AccountCheckSum: number = 0;
  accountChanged = false;
  Error: string = "";
  showToolTip: boolean = false;
  constructor() {
    super();
    console.log(this.AccountName);
    this.Account = store.AccountManager.GetAccountByName(this.AccountName);

    this.AccountCheckSum = CalcAccountChecksum(
      this.Account!.AccountData.AccountNumber
    );
  }

  mounted() {
    this.Update();
  }

  Update(forceUpdate = false) {
    if (!this.Account) {
      return;
    }
    this.autorenew_loading = true;
    this.Account.AccountData.AccountPublicKey;
    this.Balance = "???.??";

    var req = store.DataProvider.GetAccountInfo(
      this.Account.AccountData.AccountNumber,
      forceUpdate
    )
      .then(value => {
        this.Balance = value ? value.balance.toString() : "";
        this.accountChanged =
          value.updated_b !== this.Account!.AccountData.LastUpdate;

        if (
          this.Account!.AccountData.AccountPublicKey !==
          PascalPublicKey.CreateFromEncPublicKey(
            value.enc_pubkey
          ).EncodeBase58()
        ) {
          this.Error = "Stored Public Key != Safebox PublicKey <br>  - Wrong private key  <br>- Wrong accountNumber";
        }
      })
      .catch(error => (this.Balance = error.toString()))
      .finally(() => (this.autorenew_loading = false));
  }

  DeleteWallet() {
    if (!this.Account) {
      return;
    }

    var answer = confirm("Delete Account ?");

    if (answer) {
      store.AccountManager.DeleteAccount(this.AccountName);
      this.Account = undefined;
    }
  }

  IsPascalCoin(): boolean {
    if (this.Account) {
      return this.Account.AccountData.CoinType === eCoinType.PASCAL;
    }
    return false;
  }
}
</script>


  
 
