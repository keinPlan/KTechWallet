<template>
  <v-card>
    <v-responsive>
      <v-toolbar>InvoiceBuilder</v-toolbar>

      <v-card-text>
        <v-text-field label="amount" type="number"/>
        <v-layout row wrap>
          <v-text-field
            type="number"
            label="Target account number"
            placeholder="xxxxxxxx"
            required
          />
          <v-text-field
            style="width:50px"
            placeholder="xx"
            label="CheckSum"
            type="number"
            mask="##"
            required
          />
        </v-layout>

        <v-text-field label="label"/>

        <v-radio-group row label="PayloadDisplay:" mandatory>
          <v-radio label="hex" value="hex"></v-radio>
          <v-radio label="ascii" value="ascii"></v-radio>
        </v-radio-group>
        <v-textarea box label="Payload:" auto-grow></v-textarea>
      </v-card-text>
    </v-responsive>
  </v-card>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";

@Component
export default class InvoiceBuilder extends Vue {}
</script>

 