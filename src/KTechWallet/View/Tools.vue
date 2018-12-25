<template>
  <div class="md-layout md-gutter">
    <PublicKeyCheck class="md-layout-item md-size-100"/>
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

