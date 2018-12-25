<template>
  <v-layout wrap row>
    <v-flex xs12 md6>
      <v-card>
        <v-card-text>
          <v-text-field label="Name"></v-text-field>
          <v-text-field label="AccountNumber"></v-text-field>

          <v-text-field label="KeyType"></v-text-field>
          <v-text-field label="PrivateKey"></v-text-field>

          <v-text-field label="PublicKey"></v-text-field>
          <v-btn block>Save</v-btn>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 md6>
      <v-expansion-panel>
        <v-expansion-panel-content>
       
          <div slot="header">
            -0,0001 P  <v-icon color="red">trending_down</v-icon> Item   <v-spacer></v-spacer> test
              </div>
          <v-card>
            <v-card-text>testtest</v-card-text>
          </v-card>
        </v-expansion-panel-content>

        <v-expansion-panel-content>
          <div slot="header">      <v-icon color="green">trending_up</v-icon> Item</div>        
          <v-card>
            <v-card-text></v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">       <v-icon color="accent">swap_horiz</v-icon>change key</div>
          <v-card>
            <v-card-text></v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Item</div>
          <v-card>
            <v-card-text></v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import store from "../store/store";
import WalletInfoCard from "@/KTechWallet/Component/WalletInfoCard.vue";
import { eCoinType, KtlAccount } from "@/KTechLib/KtlAccount";
import { KeyTypes } from "@/KTechLib/KtlCrypto";
import { KtlKeyStorage } from "@/KTechLib/KtlKeyStorage";
import { KtlAccountData } from "@/KTechLib/KtlAccount";
import {
  KtlStorageDummy,
  KtlStorageWindowLocalStorage
} from "@/KTechLib/KtlStorage";

@Component({
  components: { WalletInfoCard }
})
export default class WalletDetailView extends Vue {
  AccountName() {
    console.log(this.$route.params);
    return this.$route.params.accountname;
  }
  Account: KtlAccount | undefined = store.AccountManager.GetAccountByName(
    this.AccountName()
  );
  IsPascalCoin(): boolean {
    if (this.Account) {
      return this.Account.AccountData.CoinType === eCoinType.PASCAL;
    }
    return false;
  }
  back() {
    this.$router.back();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

