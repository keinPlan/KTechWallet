<template>
  <v-layout wrap row>
    <v-flex xs12 md6>
      <WalletDetailCard v-bind:WalletName="this.WalletName"/>
    </v-flex>

    <v-flex xs12 md6>
      <TransactionHistoy v-bind:WalletName="this.WalletName"/>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import store from "@/KTech/store/store";
import WalletDetailCard from "@/KTech/Component/WalletDetailCard.vue";
import TransactionHistoy from "@/KTech/Component/TransactionHistoy.vue";


@Component({
  components: { WalletDetailCard, TransactionHistoy }
})
export default class WalletDetailView extends Vue {
  @Prop() WalletName!: string;
  created(){
    console.log(this.WalletName);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

