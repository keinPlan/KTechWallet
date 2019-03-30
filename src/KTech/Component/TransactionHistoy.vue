<template>
  <v-card>
    <v-responsive>
      <v-toolbar>
        <h2>TransactionHistoy</h2>
        <v-spacer/>
        <v-btn color="accent" icon @click="Update(true)" :loading="Loading">
          <v-icon>autorenew</v-icon>
        </v-btn>
      </v-toolbar>
    </v-responsive>

    <v-responsive>
      <v-alert :value="this.Error.length > 0" type="error">{{this.Error}}</v-alert>
      <v-expansion-panel focusable>
        <v-expansion-panel-content v-for="trans in this.Operations" :key="trans.ophash">
          <div slot="header">
            <v-icon large :color="GetIconColor(trans)">{{GetIcon(trans)}}</v-icon>
            <v-icon v-if="trans.block > AccountLastUpdatedAtBlock" large color="warning">fiber_new</v-icon>
            <v-icon v-if="trans.payload" large color="info">message</v-icon>
            {{trans.block}} {{trans.optxt}}
          </div>

          <TransactionDetails v-bind:AccountOperation="trans"/>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-responsive>
  </v-card>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";
import * as ktl from "@/KtechLib/KtechLib";
import TransactionDetails from "@/KTech/Component/TransactionDetails.vue";

@Component({
  components: { TransactionDetails }
})
export default class TransactionHistoy extends Vue {
  @Prop() WalletName!: string;
  Operations: ktl.IGetAccountOperationsResponse[] = [];
  Error: string = "";
  Loading: boolean = false;
  AccountLastUpdatedAtBlock = 0;

  created() {
    this.Update();
  }

  async Update(forceUpdate = false) {
    try {
      this.Error = "";
      let wallet = store.WalletManager.GetWalletByName(this.WalletName);

      if (!wallet) {
        this.Error = "wallet not found: " + this.WalletName;
        return;
      }

      this.Loading = true;
      let accinfo = await store.DataProvider.GetAccountInfo(
        wallet.AccountNumber,
        forceUpdate
      );

      this.AccountLastUpdatedAtBlock = wallet.LastUpdate;

      if (this.Operations && this.Operations.length > 0) {
        if (this.Operations[0].block === accinfo.updated_b) {
          forceUpdate = false;
        }
      }

      store.DataProvider.GetAccountOperations(wallet.AccountNumber, forceUpdate)
        .then(v => {
          this.Operations = v;
          if (wallet) {
            wallet.LastUpdate = accinfo.updated_b;
            store.WalletManager.Save();
          }
        })
        .catch(error => (this.Error = error))
        .finally(() => {
          this.Loading = false;
        });
    } catch (error) {
      this.Error = error.toString();
      this.Loading = false;
    }
  }

  GetIcon(transaction: ktl.IGetAccountOperationsResponse): string {
    if (transaction.amount === 0) {
      return "trending_flat";
    }

    if (transaction.amount < 0) {
      return "trending_down";
    }

    return "trending_up";
  }

  GetIconColor(transaction: ktl.IGetAccountOperationsResponse): string {
    if (transaction.amount === 0) {
      return "warning";
    }

    if (transaction.amount < 0) {
      return "error";
    }

    return "success";
  }
}
</script>

 