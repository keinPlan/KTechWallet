<template>
  <div class="md-layout">
 
    <v-card>
      <v-card-title>
        <v-icon color="red" class="mr-3" x-large>notification_important</v-icon>
        <h1>WARNING !!!!</h1>
      </v-card-title>
      <v-card-text>
        This stuff is experimental !!! <br>
        Use at your own risk !!! <br>
        <br>   

        <v-btn block href="#/wallet/send/?target=606554-60&amount=0.1&payload=646f6e6174696f6e732077656c636f6d65203d50&payloadType=ascii"  >invoicetest</v-btn>  
      </v-card-text>

  </v-card>
    
    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Home extends Vue {}
</script>

