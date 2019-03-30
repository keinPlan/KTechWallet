<template>
  <v-dialog v-model="storeNotReady" fullscreen persistent>
    <v-card color="gray">
    
     
     
      <v-layout justify-center justify-end >
        <v-flex md4>
           
           
          <v-card class="mt-5" color="primary">
            
            <v-card-title class="headline">Wallet Mode Selection</v-card-title>
          <v-card-text>
            GDrive: Save and load data from your GDrive<br>
            Local: Save and load data from in your Browser
          </v-card-text>
            <v-card-actions>
              <v-btn block :loading="loading" @click="StartGDriveMode">
                <img class="mr-2" src="/GDrive.png" height="24" width="24">
                GDrive
              </v-btn>

              <v-btn block :loading="loading" @click="StartLocalMode">
                <v-icon class="mr-2" color="accent">folder</v-icon>Local
              </v-btn>
            </v-card-actions>

            <v-card-actions></v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
      {{ErrorMsg}}
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";

import store from "../store/store";

import {
  KtlStorageGdrive,
  KtlStorageWindowLocalStorage
} from "@/KTechLib/KTechLib";
import router from "@/KTech/router";

@Component
export default class WalletCreateAccountView extends Vue {
  loading: boolean = false;
  ErrorMsg: string = "";
  storeNotReady: boolean = !store.IsReady;
  storageGdrive: KtlStorageGdrive = new KtlStorageGdrive();

  public StartGDriveMode() {
    this.loading = true;

    this.storageGdrive
      .Connect()
      .then(() => {
        // connect ok
        return store.Init(this.storageGdrive);
      })
      .catch(err => {
        // error
        this.ErrorMsg = JSON.stringify(err);
      })
      .finally(() => {
        this.loading = false;
        this.$emit("StateChange");
        this.storeNotReady = !store.IsReady;
      });
  }

  public StartLocalMode() {
    this.loading = true;
    let storage = new KtlStorageWindowLocalStorage();

    store
      .Init(storage)
      .catch(err => {
        // error
        this.ErrorMsg = err;
      })
      .finally(() => {
        this.loading = false;
        this.$emit("StateChange");
        this.storeNotReady = !store.IsReady;
      });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

