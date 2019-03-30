<template>
  <!-- add contacts dialog-->
  <v-dialog persistent max-width="400px" v-model="Show">
    <v-card>
      <v-responsive>
        <v-toolbar>
          <h1 color="primary">Add new contact</h1>
        </v-toolbar>
      </v-responsive>
      <v-card-text>
        <v-text-field label="ContactName" v-model="NewContractData.ContactName"></v-text-field>
        <v-layout row wrap>
          <v-text-field
            v-model="NewContractData.ContactAccountNumber"
            type="number"
            label="account number"
            placeholder="xxxxxxxx"
            required
          />
          <v-text-field
            style="width:50px"
            v-model="NewContractData.ContactAccountNumberCheckSum"
            placeholder="xx"
            label="CheckSum"
            type="number"
            mask="##"
            required
          />
        </v-layout>
        <v-alert :value="Error !== ''" type="error">{{Error}}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn @click="AddContact" color="accent">Add</v-btn>
        <v-btn @click="$emit('Show',false)" color="primary">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Provide,
  Vue,
  Model,
  Emit
} from "vue-property-decorator";

import store from "../store/store";

import { IKtlContact, CalcAccountChecksum } from "@/KTechLib/KTechLib";

@Component
export default class CreateContact extends Vue {
  @Model("Show") Show: boolean = false;
  Error: string = "";

  NewContractData: IKtlContact = <IKtlContact>{
    ContactAccountNumber: 0,
    ContactAccountNumberCheckSum: 0,
    ContactName: ""
  };

  AddContact() {
    this.Error = "";
    if (
      CalcAccountChecksum(
        this.NewContractData.ContactAccountNumber
      ).toString() !==
      this.NewContractData.ContactAccountNumberCheckSum.toString()
    ) {
      this.Error = "Invalid account checksum!!!";
      return;
    }

    if (this.NewContractData.ContactName.indexOf("#") !== -1) {
      this.Error = "# is not allowed in accountname";
      return;
    }
    if (this.NewContractData.ContactName.length === 0) {
      this.Error = "accountname is needed";
      return;
    }

    store.ContactsManager.Add(this.NewContractData);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

