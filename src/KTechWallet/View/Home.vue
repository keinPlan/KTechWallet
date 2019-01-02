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

        <v-btn
          block
          href="#/wallet/send/?target=606554-60&amount=0.1&payload=646f6e6174696f6e732077656c636f6d65203d50&payloaddisplay=ascii"
        >invoicetest</v-btn>

        <v-btn @click="RegisterHandler" block>RegisterUriHandler (web+pasc:)</v-btn>
        <v-btn :href="testloginLink">web+pasc:action=login</v-btn>
        <v-btn
          href="web+pasc:action=pay&target=606554-60&label=just a test msg%0Atest test test%0Atest test test%0Atest test test%0Atest test test&amount=0.1&payload=646f6e6174696f6e732077656c636f6d65203d50&payloaddisplay=ascii"
        >web+pasc:action=pay</v-btn>

        <v-btn @click="Install">install</v-btn>
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
  deferredPrompt: any = null;
  created() {
    let acc = store.AccountManager.GetAccountByName("secp256k1");
    if (acc) {
      let w = new BinaryReaderWriter();
      w.AddByte(4);
      w.AddBytes(
        PascalPublicKey.CreateFromBase58Key(acc!.AccountData.AccountPublicKey)!
          .x
      );
      w.AddBytes(
        PascalPublicKey.CreateFromBase58Key(acc!.AccountData.AccountPublicKey)!
          .y
      );

      let msg = new Uint8Array(32);
      let data = EcCrypto.ECDHEncrypt(
        acc!.AccountData.KeyType,
        w.ToArray(),
        msg
      );
      this.testloginLink =
        "web+pasc:action=login&accountid=" +
        acc!.AccountData.AccountNumber +
        "&publickey=" +
        data.publicKey +
        "&challenge=" +
        Uint8ArrayToHex(data.data) +
        "&callback=http://localhost:8090/PlayGround/#/";
      // "web+pasc:action=login&accountid=123123123&publickey=fffffffffffffffffffffffffffffffff&challenge=ffffffffffffffffffffffffffffffff&callback=http://localhost:8090/KTechKeystore/#/";
    }

    window.addEventListener("beforeinstallprompt", e => {
      
      console.log("beforeinstallprompt");
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
    });
  }

  Install() {
    console.log(this.deferredPrompt);
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

  RegisterHandler() {
    let temp = navigator as any;
    let path = document.location.origin + document.location.pathname;

    try {
      temp.registerProtocolHandler(
        "web+pasc",
        path + "#/urihandler?q=%s",
        "KTechWallet"
      );
    } catch (error) {
      console.log(error);
    }
  }
}
</script>

