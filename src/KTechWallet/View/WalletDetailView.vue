<template>
  <v-layout wrap row>
    <v-flex xs12 md6>
      <WalletDetailCard v-bind:AccountName="this.AccountName" v-bind:CanEdit="true"/>
    </v-flex>

    <v-flex xs12 md6>
      <TransactionHistoy v-bind:AccountName="this.AccountName"/>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import store from "../store/store";
import WalletDetailCard from "@/KTechWallet/Component/WalletDetailCard.vue";
import TransactionHistoy from "@/KTechWallet/Component/TransactionHistoy.vue";
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
  components: { WalletDetailCard, TransactionHistoy }
})
export default class WalletDetailView extends Vue {
  @Prop() AccountName!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

