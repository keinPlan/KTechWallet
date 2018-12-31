<template>
  <div class="md-layout md-gutter">
    <PublicKeyCheck class="md-layout-item md-size-100"/>
    <InvoiceBuilder/>
    <v-btn @click="test10">test</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import PublicKeyCheck from "@/KTechWallet/Component/PublicKeyCheck.vue";
import InvoiceBuilder from "@/KTechWallet/Component/InvoiceBuilder.vue";
import store from "../store/store";
import * as ktl from "@/KTechLib/KTechLib";
import { Uint8ArrayFromHex } from "@/KTechLib/KTechLib";

@Component({
  components: { PublicKeyCheck ,InvoiceBuilder}
})
export default class Tools extends Vue {
  async test10() {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

