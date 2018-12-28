<template>
  <div class="md-layout md-gutter">
    <PublicKeyCheck class="md-layout-item md-size-100"/>
    <v-btn @click="test10">test</v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import PublicKeyCheck from "@/KTechWallet/Component/PublicKeyCheck.vue";
import store from "../store/store";


@Component({
  components: { PublicKeyCheck }
})
export default class Tools extends Vue { 
  async test10() {  
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

