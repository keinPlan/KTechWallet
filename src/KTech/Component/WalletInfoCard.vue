
<template>
  <v-card v-if="this.Wallet">




    <v-card-title>
      <div>
        <h3 class="headline mb-0">{{WalletName}}</h3>
        {{ this.Wallet.AccountNumber}}-{{AccountCheckSum}}
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


    <v-alert class="mr-2 ml-2" :value="error !== ''" v-html="error"></v-alert>
   
 
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn icon @click="DeleteWallet">
        <v-icon>delete</v-icon>
      </v-btn>

      <v-btn
        icon
        :to="{name:'walletInfo' ,params: { WalletName: this.WalletName } }"
        :color="(this.accountChanged ? 'accent':'')"
      >
        <v-icon>{{(this.accountChanged ? 'notification_important':'info')}}</v-icon>
      </v-btn>

      <v-btn icon :to="{ name:'walletSend' , params: { WalletName: this.WalletName }}">
        <v-icon>send</v-icon>
      </v-btn>
      <v-btn icon @click="Update(true)" :loading="autorenew_loading">
        <v-icon>autorenew</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";

import {
  KtlWallet,
  eCoinType,
  eKeyTypes,
  KtlStorageWindowLocalStorage,
  CalcAccountChecksum,
  PascalPublicKey
} from "@/KTechLib/KTechLib";

@Component({})
export default class WalletInfoCard extends Vue {
  @Prop() public WalletName!: string;
  Wallet!: KtlWallet | undefined;
  Balance: string = "xxx.xx";
  lastupdate: string = "";
  autorenew_loading: boolean = false;
  AccountCheckSum: number = 0;
  accountChanged = false;
  error: string = "";

  constructor() {
    super();

    this.Wallet = store.WalletManager.GetWalletByName(this.WalletName);

    this.AccountCheckSum = CalcAccountChecksum(this.Wallet!.AccountNumber);
  }

  mounted() {
    this.Update();
  }

  Update(forceUpdate = false) {
    if (!this.Wallet) {
      return;
    }
    this.autorenew_loading = true;
    this.Wallet.AccountNumber;
    this.Balance = "???.??";

    var req = store.DataProvider.GetAccountInfo(
      this.Wallet.AccountNumber,
      forceUpdate
    )
      .then(value => {
        this.Balance = value ? value.balance.toString() : "";
        this.accountChanged = value.updated_b !== this.Wallet!.LastUpdate;

        let publickeyB58: string = PascalPublicKey.CreateFromEncPublicKey(
          value.enc_pubkey
        ).EncodeBase58();

        if (this.Wallet!.PublicKey !== publickeyB58) {
          this.Wallet!.PublicKey = publickeyB58;
        }

        if (
          store.KeyManager.GetPublicKeys.indexOf(this.Wallet!.PublicKey) === -1
        ) {
          this.error = "no privatekey found for this account";
        }
      })
      .catch(error => {
        this.Balance = error.toString();
        this.error = "ERROR: " + JSON.stringify(error);
      })
      .finally(() => (this.autorenew_loading = false));
  }

  DeleteWallet() {
    if (!this.Wallet) {
      return;
    }

    var answer = confirm("Delete Account ?");

    if (answer) {
      store.WalletManager.Delete(this.Wallet.Name);
      this.Wallet = undefined;
    }
  }

  IsPascalCoin(): boolean {
    if (this.Wallet) {
      return this.Wallet.CoinType === eCoinType.PASCAL;
    }
    return false;
  }
}
</script>


  
 
