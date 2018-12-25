<template>
  <div>
    <v-subheader>Wallet</v-subheader>
    <v-list-tile to="/wallet/createaccount">
      <v-list-tile-action>
        <v-icon color="red">add</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Create</v-list-tile-title>
      
      </v-list-tile-content>
    </v-list-tile>
  </div>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";

@Component
export default class MenuWallet extends Vue {}
</script>

 