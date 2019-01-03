<template>
  <v-card>
    <v-responsive>
      <v-toolbar>InvoiceBuilder</v-toolbar>

      <v-card-text>
          <v-text-field v-model="protocol" label="protocol" />
        <v-text-field v-model="amount" label="amount" type="number"/>
        <v-layout row wrap>
          <v-text-field
            v-model="targetAccount"
            type="number"
            label="Target account number"
            placeholder="xxxxxxxx"
            required
          />
        </v-layout>

        <v-textarea v-model="infoMsg" auto-grow label="InfoMsg"/>

        <v-radio-group v-model="payloadType" row label="PayloadDisplay:" mandatory>
          <v-radio label="hex" value="hex"></v-radio>
          <v-radio label="ascii" value="ascii"></v-radio>
        </v-radio-group>
        <v-textarea v-model="payload" box label="Payload:" auto-grow></v-textarea>
      </v-card-text>

      <v-toolbar>Output:</v-toolbar>
      <v-btn @click="Generate" color="accent" block>Generate</v-btn>
      <v-textarea v-model="output" box label="output:" auto-grow></v-textarea>
      <v-btn :href="output" color="accent" block>link</v-btn>
    </v-responsive>
  </v-card>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import {
  CalcAccountChecksum,
  Uint8ArrayFromHex,
  StringToHexString
} from "@/KTechLib/KTechLib";

@Component
export default class UriBuilder extends Vue {
  protocol:string="web+pasc"
  actions: string = "pay";
  targetAccount: number = 606554;

  // pay
  infoMsg: string = "xxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\n      Danke für die Blumen!\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  payloadType: string = "ascii";
  payload: string = "xxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nLila Osterhase !\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx\nxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  amount: number = 0.0001;

  // login
  callback: string = "";
  publickey: string = "";

  output: string = "";

  Generate() {
    this.output =
      this.protocol +"://" +
      "action=pay" +
      "&label=" +
      encodeURIComponent(this.infoMsg) +
      "&target=" +
      this.targetAccount +
      "-" +
      CalcAccountChecksum(this.targetAccount) +
      "&amount=" +
      this.amount +
      "&payload=" +
      (this.payloadType === "hex"
        ? this.payload
        : StringToHexString(this.payload)) +
      "&payloaddisplay=" +
      this.payloadType;
  }
}
</script>

 