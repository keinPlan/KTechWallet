<template>
  <v-card>
    <v-card-text>
      
      <!-- payload -->
      <div v-if="AccountOperation.payload.length">
        <v-toolbar >
          <h2>Payload:</h2>
          <v-spacer/>
          <v-btn-toggle v-model="payLoadFromat">
            <v-btn color="accent" flat value="HEX" @click="TogglePayload('HEX')">Hex</v-btn>
            <v-btn color="accent" flat value="ASCII" @click="TogglePayload('ASCII')">ASCII</v-btn>
          </v-btn-toggle>
        </v-toolbar>
        <v-text-field box v-model="payload" disabled/>
        <br>
      </div>

      <!-- AccountOperation -->
      <div>
        <v-toolbar  >
          <h2>RawOperationData:</h2>
          <v-spacer/>
          <v-btn color="accent" icon @click="ShowRawOperationData=!ShowRawOperationData">
            <v-icon>{{ShowRawOperationData ? 'visibility' : 'visibility_off'}}</v-icon>
          </v-btn>
        </v-toolbar>
        <v-textarea
          v-show="ShowRawOperationData"
          box
          disabled
          v-model="rawOperationData"
          :rows="rawOperationDataLines"
        />
      </div>
    </v-card-text>
  </v-card>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";
import * as ktl from "@/KtechLib/KtechLib";
import { HexStringToAsciiString, StringToHexString } from "@/KTechLib/KTechLib";

@Component
export default class TransactionDetails extends Vue {
  @Prop() AccountOperation!: ktl.IGetAccountOperationsResponse;
  payload: string = "";
  payLoadFromat: string = "HEX";
  rawOperationData!: string;
  rawOperationDataLines: number = 0;
  ShowRawOperationData: boolean = false;

  mounted() {
    this.payload = this.AccountOperation.payload;
    this.rawOperationData = JSON.stringify(this.AccountOperation, null, 4);
    this.rawOperationDataLines = this.rawOperationData.split("\n").length;
    console.log(this.rawOperationDataLines);
  }

  TogglePayload(v: string) {
    if (v === "HEX") {
      this.payload = this.AccountOperation.payload;
    } else {
      this.payload = HexStringToAsciiString(this.AccountOperation.payload);
    }
  }
  OpTypeToName(): string {
    switch (this.AccountOperation.optype) {
      case 1:
        return "Transaction";
      case 2:
        return "ChangeKey";
      case 3:
        return "Recover funds";
      case 4:
        return "List account for sale";
      case 5:
        return "Delist account";
      case 6:
        return "Buy account";
      case 7:
        return "ChangeKeySigned";
      case 8:
        return "Change account info";
      case 9:
        return "MultiOperation";
      case 10:
        return "Op Data";
      default:
        return "unknown OperationType";
    }
  }
}
</script>

 