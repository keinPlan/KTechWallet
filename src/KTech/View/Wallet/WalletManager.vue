<template>
  <v-layout wrap row>
    <v-flex xs12>
      <v-btn color="primary" @click="ShowCreateWalletDialog = !ShowCreateWalletDialog">
        <v-icon>add</v-icon>Add Wallet
      </v-btn>

      <CreateWallet v-model="ShowCreateWalletDialog" @Show="ShowCreateWalletDialog"/>

    </v-flex>

    <v-flex xs12 sm6 md4 lg4 xl3 v-for="name in walletNames " :key="name">
      <WalletInfoCard v-bind:WalletName="name"/>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from "vue-property-decorator";
import WalletInfoCard from "@/KTech/Component/WalletInfoCard.vue";
import CreateWallet from "@/KTech/Component/CreateWallet.vue";
import store from "@/KTech/store/store";

@Component({
  components: { WalletInfoCard, CreateWallet }
})

export default class WalletManager extends Vue {
  walletNames: string[] = store.WalletManager.GetWalletNames();
  ShowCreateWalletDialog: boolean = false;

  @Watch("ShowCreateWalletDialog")
  ShowCreateWalletDialogChanged(value: boolean) {
    if (!value) {
      this.walletNames = store.WalletManager.GetWalletNames();
      console.log(this.walletNames);
    }
  }
}
</script>