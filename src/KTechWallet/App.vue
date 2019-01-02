<template>
  <v-app :dark="dark">
    <v-navigation-drawer app right v-model="drawer">
      <v-toolbar flat>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title">KTechWallet</v-list-tile-title>
          </v-list-tile>

          <router-view name="navbar"></router-view>

          <v-subheader>General</v-subheader>
          <v-list-tile to="/config">
            <v-list-tile-action>
              <v-icon color="indigo">settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Config</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

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
          </v-list-tile>

          <v-list-tile @click="dark=!dark">
            <v-list-tile-action>
              <v-icon>{{dark?'toggle_on' :'toggle_off'}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Dark</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-toolbar>
    </v-navigation-drawer>

    <!-- TOOLBAR -->
    <v-toolbar app>
      <v-btn v-if="deferredPrompt ? true:false" color="accent" @click="Install">Install</v-btn>

      <v-spacer></v-spacer>

      <v-btn icon to="/">
        <v-icon>whatshot</v-icon>
      </v-btn>

      <v-btn icon to="/tools">
        <v-icon>build</v-icon>
      </v-btn>

      <v-btn icon to="/contacts">
        <v-icon>account_box</v-icon>
      </v-btn>

      <v-btn icon to="/wallet">
        <v-icon>account_balance_wallet</v-icon>
      </v-btn>

      <v-toolbar-side-icon @click="drawer = true"></v-toolbar-side-icon>
    </v-toolbar>

    <!-- CONTENT -->
    <v-content warp>
      <div class="ma-4"/>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Emit } from "vue-property-decorator";
import store from "./store/store";
import { readFileSync } from "fs";

@Component
export default class App extends Vue {
  drawer: boolean = false;
  dark: boolean = true;
  deferredPrompt: any = null;

  created() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function() {
        let path = document.location.origin + document.location.pathname;
        navigator.serviceWorker.register(path + "sw.js").then(
          function(registration) {
            // Registration was successful
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope
            );
          },
          function(err) {
            // registration failed :(
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      });
    }

    window.addEventListener("beforeinstallprompt", e => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      console.log("beforeinstallprompt");
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
    });
  }

  Install() {
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      this.deferredPrompt = null;
    });
  }

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

      let temp: { Accounts: string; Contact: string } = JSON.parse(
        rr.target!.result
      );

      store.AccountManager.Import(temp.Accounts);
      store.ContactsManager.Import(temp.Contact);
      this.$router.go(0);
    };
  }

  ExportWallet() {
    let data = store.AccountManager.Export();
    let contact = store.ContactsManager.Export();
    data = JSON.stringify({ Accounts: data, Contact: contact }, null, 4);

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
}
</script>


<style lang="scss"  >
.v-card {
  //background-color: red; // var(pimary)
  //color: red; // var(pimary)
  margin: 10px;
}

.v-btn--active {
  margin: 20px;
  color: red !important;
}
</style>