<template>
  <div>
    <!-- fab add button -->
    <v-speed-dial fixed bottom right>
      <v-btn fab slot="activator" color="accent" @click="showAddDialog=!showAddDialog">
        <v-icon>add</v-icon>
      </v-btn>
    </v-speed-dial>

    <!-- add contacts dialog-->
    <v-dialog lazy persistent fullscreen :value="showAddDialog">
      <v-card>
        <v-card-text>
          <v-toolbar>
            <h1>Add new contact</h1>
          </v-toolbar>
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
          <v-btn @click="showAddDialog=!showAddDialog" color="primary">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- display contacts-->
    <v-layout wrap row>
      <v-flex xs12 sm6 md4 lg4 xl3 v-for="name in contactNames" :key="name">
        <v-card>
          <v-responsive>
            <v-toolbar>
              <h2>{{GetContat(name).ContactName}}</h2>
              <v-spacer/>
              <v-btn icon>
                <v-icon @click="Delete(name)">delete</v-icon>
              </v-btn>
            </v-toolbar>
          </v-responsive>
          <v-card-text>
            <div>{{GetContat(name).ContactAccountNumber}}-{{GetContat(name).ContactAccountNumberCheckSum}}</div>
          </v-card-text>
        </v-card>
      </v-flex>
      <!-- no content display-->
      <v-flex xs12 v-if="contactNames.length ===0">
        <v-card>
          <v-card-title>
            <h1>No contact's found</h1>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import store from "../store/store";

import {
  KtlAccountData,
  eCoinType,
  KtlKeyStorage,
  eKeyTypes,
  KtlAccount,
  KtlStorageWindowLocalStorage,
  IKtlContact,
  CalcAccountChecksum
} from "@/KTechLib/KTechLib";

@Component({})
export default class Contacts extends Vue {
  contactNames: string[] = store.ContactsManager.GetAccountNames();
  showAddDialog: boolean = false;
  NewContractData: IKtlContact = <IKtlContact>{
    ContactAccountNumber: 0,
    ContactAccountNumberCheckSum: 0,
    ContactName: ""
  };

  Error: string = "";

  GetContat(name: string): IKtlContact | undefined {
    return store.ContactsManager.GetAccountByName(name)!;
  }

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
    this.contactNames = store.ContactsManager.GetAccountNames();
    alert(JSON.stringify(this.NewContractData) + "\nwas added !! ");
    this.NewContractData = <IKtlContact>{
      ContactAccountNumber: 0,
      ContactAccountNumberCheckSum: 0,
      ContactName: ""
    };
  }

  Delete(name: string): void {
    store.ContactsManager.Delete(name);
    this.contactNames = store.ContactsManager.GetAccountNames();
  }
}
</script>

 

