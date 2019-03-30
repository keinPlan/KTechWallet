<template>
  <v-card>
    <v-card-title>
      <div>Pascal PublicKey Decoder</div>
    </v-card-title>

    <v-card-text>
      <v-text-field label="Pascal PublicAddress" v-model="publicKeyBase58"/>

      <v-textarea label="Output:" v-model="output"></v-textarea>}}
    </v-card-text>

    <v-card-actions>
      <v-btn @click="onClick">Decode</v-btn>
      <v-btn @click="deleteResult">CLEAR</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import * as pascalCoin from "@/KTechLib/PascalCoin/PascalCoin";

@Component
export default class PublicKeyCheck extends Vue {
  publicKeyBase58: string = "";
  output: string = "";

  onClick() {
    //alert(JSON.stringify(new PublicKeyData(this.publicKeyBase58)));

    let keydata = pascalCoin.PascalPublicKey.CreateFromBase58Key(
      this.publicKeyBase58
    );

    if (keydata) {
      this.output = JSON.stringify(keydata, null, 4);
    }
  }

  deleteResult() {
    this.output = "";
  }
}
</script>


