<template>
  <div class="md-layout md-gutter">
    <PublicKeyCheck class="md-layout-item md-size-100"/>
    <UriBuilder/>
    <v-btn @click="test10">test</v-btn>
    <v-btn href="web+pasc://test">test</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import PublicKeyCheck from "@/KTechWallet/Component/PublicKeyCheck.vue";
import UriBuilder from "@/KTechWallet/Component/UriBuilder.vue";
import store from "../store/store";
import * as ktl from "@/KTechLib/KTechLib";
import { Uint8ArrayFromHex } from "@/KTechLib/KTechLib";

@Component({
  components: { PublicKeyCheck ,UriBuilder}
})
export default class Tools extends Vue {
  created(){
    console.log( JSON.stringify( window.location));
  }
  async test10() {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

