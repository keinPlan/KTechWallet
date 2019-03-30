<template>
  <div class="md-layout">
    <v-card>
      <v-card-title>
        <v-icon color="red" class="mr-3" x-large>notification_important</v-icon>
        <h1>WARNING !!!!</h1>
      </v-card-title>
      <v-card-text>This stuff is experimental !!!
        <br>Use at your own risk !!!
        <br>
        <br>

        
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import {
  EcCrypto,
  PascalPublicKey,
  BinaryReaderWriter,
  Uint8ArrayToHex
} from "@/KTechLib/KTechLib";
import store from "../store/store";
@Component
export default class Home extends Vue {
  testloginLink: string = "";

  created() {    
  }


}
</script>

