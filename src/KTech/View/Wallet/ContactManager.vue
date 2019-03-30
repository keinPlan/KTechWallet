<template>
  <div>
    <!-- display CreateContact-->
    <CreateContact v-model="showAddDialog" @show="showAddDialog"/>
    <v-flex xs12>
      <v-btn color="primary" @click="showAddDialog =!showAddDialog">
        <v-icon>add</v-icon>Add Contact
      </v-btn>    
    </v-flex>
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

import CreateContact from "@/KTech/Component/CreateContact.vue";
import store from "@/KTech/store/store";

import {
  eCoinType,
  eKeyTypes,
  KtlStorageWindowLocalStorage,
  IKtlContact,
  CalcAccountChecksum
} from "@/KTechLib/KTechLib";

@Component({
  components: {  CreateContact }
})
export default class ContactManager extends Vue {
  contactNames: string[] = store.ContactsManager.GetAccountNames();
  showAddDialog: boolean = false;

  GetContat(name: string): IKtlContact | undefined {
    return store.ContactsManager.GetAccountByName(name)!;
  }

  Delete(name: string): void {
    store.ContactsManager.Delete(name);
    this.contactNames = store.ContactsManager.GetAccountNames();
  }
}
</script>

 

