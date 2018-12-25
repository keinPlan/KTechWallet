<template>
  <md-card class="md-elevation-10">
    <md-card-header>
      <div class="md-title">Pascal Decoder</div>
      <div class="md-subhead">PublicKey</div>
    </md-card-header>

    <md-card-content>
      <md-field>
        <label>Pascal PublicAddress</label>
        <md-textarea v-model="publicKeyBase58"></md-textarea>
      </md-field>

      <md-field>
        <label>Output:</label>
        <md-textarea v-model="output"></md-textarea>
        <span class="md-helper-text">{{IsValid}}</span>
      </md-field>
    </md-card-content>

    <md-card-actions>
      <md-button class="md-accent md-elevation-1" @click="onClick">Decode</md-button>
      <md-button class="md-accent md-elevation-1" @click="deleteResult">CLEAR</md-button>
    </md-card-actions>
  </md-card>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import * as pascalCoin from "@/KTechLib/PascalCoin/PascalCoin";

@Component
export default class PublicKeyCheck extends Vue {
  publicKeyBase58: string = "";
  output: string = "";
  IsValid: string = "";

  onClick() {
    //alert(JSON.stringify(new PublicKeyData(this.publicKeyBase58)));

    let keydata = pascalCoin.PascalPublicKey.CreateFromBase58Key(
      this.publicKeyBase58
    );

    if (keydata) {
      this.output = JSON.stringify(keydata, null, 4);
     
     if (keydata.IsValid()) {
        this.IsValid = "OK";
      } else {
          this.IsValid = "Invalid publicKey";
      } 
    }else{
        this.IsValid = "Error";
    }
  }
  deleteResult() {
    this.output = "";
    this.IsValid ="";
  }
}
</script>


<style lang="scss" >
.md-card {
  flex: 1;
  padding: 10px;
  margin: 5px;
  max-width: 1000px;
  width: 100%;
}
</style>