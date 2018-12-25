<template> 
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import * as pascalCoin from "@/KTechLib/PascalCoin/PascalCoin";

@Component
export default class PrivateKey extends Vue {
  @Prop() AccountName !:string;

}
</script>


 