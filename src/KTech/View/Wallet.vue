<template>
  <v-app >
    <v-navigation-drawer app right v-model="drawer">
      <v-toolbar>
        <v-list>
          <v-list-tile class="mb-4">
            <v-list-tile-title class="title">KTechWallet</v-list-tile-title>
          </v-list-tile>

           <v-list-tile>
          <v-btn icon to="/">
            <v-icon>whatshot</v-icon>
          </v-btn>

          <v-btn icon to="/tools">
            <v-icon>build</v-icon>
          </v-btn>
           </v-list-tile>
          <v-subheader>General</v-subheader>
          <v-list-tile to="/config">
            <v-list-tile-action>
              <v-icon color="indigo">settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Config</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <!--
          <v-list-tile @click="ExportWallet">
            <v-list-tile-action>
              <v-icon color="red">call_made</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Export</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <input ref="file" type="file" v-show="false" @change="Import">
          <v-list-tile @click="importClicked">
            <v-list-tile-action>
              <v-icon color="green">call_received</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Import</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile> -->

         
       
         
        </v-list>
      </v-toolbar>
    </v-navigation-drawer>

    <!-- TOOLBAR -->
    <v-toolbar app>
      <!-- unlock key manager dialog -->
      <v-btn
        v-if="this.keymanager"
        v-show="this.keymanager.InitDone()"
        :color="this.keymanager.IsLocked ?  'green':'red'"
        @click="ToggleLock"
      >
        <v-icon color="black">{{this.keymanager.IsLocked ? 'lock' : 'lock_open'}}</v-icon>
      </v-btn>
      <UnlockKeysDialog v-model="showUnlockDialog" @show="showUnlockDialog"/>

      <v-spacer></v-spacer>

      <v-btn icon to="/keymanager">
        <v-icon>vpn_key</v-icon>
      </v-btn>

      <v-btn icon to="/contacts">
        <v-icon>account_box</v-icon>
      </v-btn>

      <v-btn icon to="/WalletView">
        <v-icon>account_balance_wallet</v-icon>
      </v-btn>

      <v-toolbar-side-icon @click="drawer = true"></v-toolbar-side-icon>
    </v-toolbar>

    <!-- CONTENT -->
    <v-content warp>
      <div class="ma-4"/>
      <router-view v-if="keymanager"></router-view>
    </v-content>

    <!--Select Mode-->
    <SelectWalletMode v-on:StateChange="ForceUpdate"/>
  </v-app>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Model,
  Emit,
  Watch
} from "vue-property-decorator";
import store from "./../store/store";
import { readFileSync, watch } from "fs";
import {
  KtlStorageWindowLocalStorage,
  KtlStorageGdrive,
  eKtlStorageState,
  KtlKeyManager
} from "@/KTechLib/KTechLib";

import SelectWalletMode from "@/KTech/Component/SelectWalletMode.vue";
import UnlockKeysDialog from "@/KTech/Component/UnlockKeysDialog.vue";

@Component({
  components: { SelectWalletMode, UnlockKeysDialog }
})
export default class Wallet extends Vue {
  drawer: boolean = false;  
  deferredPrompt: any = null;
  keymanager: KtlKeyManager = store.KeyManager;
  showUnlockDialog:boolean=false;

  ForceUpdate() {
    //this.$forceUpdate();
    this.keymanager = store.KeyManager;
    this.$forceUpdate();
  }

  get IsKeyMangerInitDone() {
    if (!this.keymanager) return false;
    return this.keymanager.InitDone();
  }

  created() {}

  beforeCreate() {
    //store.Init(new KtlStorageWindowLocalStorage());
  }
  mounted() {}

  back() {
    this.$router.go(-1);
  }

  importClicked() {
    (this.$refs.file as any).click();
  }

  Import(files: any) {
    let fl: FileList = files.srcElement.files as FileList;

    let r = new FileReader();
    r.readAsText(fl[0]);

    r.onloadend = (rr: any) => {
      //console.log(rr.target!.result);

      let temp: { Wallets: string; Contact: string; Keys: string } = JSON.parse(
        rr.target!.result
      );

      store.WalletManager.Import(temp.Wallets);
      store.ContactsManager.Import(temp.Contact);
      store.KeyManager.Import(temp.Keys);
      this.$router.go(0);
    };
  }

  ExportWallet() {
    let wallets = store.WalletManager.Export();
    let contact = store.ContactsManager.Export();
    let keydata = store.KeyManager.Export();
    let data = JSON.stringify(
      { Wallets: wallets, Contact: contact, Keys: keydata },
      null,
      4
    );

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(data)
    );
    element.setAttribute("download", "KTech_Export.data");

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  // key unlocking
  UnlockKeysDialogShow: boolean = false;
  UnlockKeymanagerPassword: string = "";
  UnlockError: string = "";

  @Watch("UnlockKeysDialogShow")
  UnlockKeysDialogShowChanged(value: boolean) {
    if (value === false) {
      this.UnlockKeymanagerPassword = "";
    } else {
      console.log(this.$refs.passwordBox);

      (this.$refs as any).passwordBox.focus();
    }
  }

  ToggleLock(){
    if(this.keymanager.IsLocked){
      this.showUnlockDialog= true;
    }else{
      this.keymanager.Lock();
    }

  }
}
</script>
