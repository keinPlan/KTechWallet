<template>
  <v-layout wrap row>
   <!--  <v-flex xs12 md6>
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
    </v-flex> -->

    <v-flex xs12 md6>
      <v-btn block @click="test">test</v-btn>
      <!--       <div v-for="trans in this.Transactions" :key="trans.block">
        <v-icon color="red">trending_down</v-icon>
        {{trans.block}} {{trans.optxt}}
      </div>-->
      <v-expansion-panel focusable>
        <v-expansion-panel-content v-for="trans in this.Transactions" :key="trans.block">
          <div slot="header">
            <v-icon v-if="trans.block > lastupdate" large color="warning">fiber_new</v-icon>

            <v-icon large :color="GetIconColor(trans)">{{GetIcon(trans)}}</v-icon>
            {{trans.block}} {{trans.optxt}}
          </div>
          <v-card>
            <v-card-text>
              Block: {{trans.block}}
              <br>
              maturation: {{trans.maturation}}
              <br>
              amount: {{trans.amount}}
              <br>
              fee: {{trans.fee}}
              <br>
              payload: {{trans.payload}}
              <br>
            </v-card-text>
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
import { eKeyTypes } from "@/KTechLib/KtlCrypto";
import { KtlKeyStorage } from "@/KTechLib/KtlKeyStorage";
import { KtlAccountData } from "@/KTechLib/KtlAccount";
import {
  KtlStorageDummy,
  KtlStorageWindowLocalStorage
} from "@/KTechLib/KtlStorage";
import * as ktechLib from "@/KTechLib/KTechLib";
import { IGetAccountOperationsResponse } from "@/KTechLib/KTechLib";
import { colors } from "vuetify/lib";

@Component({
  components: { WalletInfoCard }
})
export default class WalletDetailView extends Vue {
  @Prop() AccountName!: string;

  lastupdate: number = 0;

  mounted() {
    this.lastupdate = this.Account!.AccountData.LastUpdate;
    if (!this.lastupdate) {
      this.lastupdate = 0;
    }
    console.log(this.lastupdate);
    console.log(this.Account);
  }

  Transactions: IGetAccountOperationsResponse[] = Array<
    IGetAccountOperationsResponse
  >(0);

  Account: KtlAccount | undefined = store.AccountManager.GetAccountByName(
    this.AccountName
  );

  GetIcon(transaction: IGetAccountOperationsResponse): string {
    if (transaction.amount === 0) {
      return "trending_flat";
    }

    if (transaction.amount < 0) {
      return "trending_down";
    }

    return "trending_up";
  }

  GetIconColor(transaction: IGetAccountOperationsResponse): string {
    if (transaction.amount === 0) {
      return "warning";
    }

    if (transaction.amount < 0) {
      return "error";
    }

    return "success";
  }

  test() {
    console.log(this.AccountName);
    let cmd = new ktechLib.GetAccountOperations(
      this.Account!.AccountData.AccountNumber,
      100,
      -1
    );

    cmd.Execute(store.WalletConfig.RpcServer).then(v => {
      this.Transactions = v;
      this.Account!.AccountData.LastUpdate = v[0].block;
      this.Account!.Save();
    });
  }

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

