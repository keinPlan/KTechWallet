
<template>
  <v-form ref="keyImportForm">
    <v-card class="pa-0 ma-0">
      <v-responsive>
        <v-toolbar>
          <h2>KeyGenerator:</h2>
        </v-toolbar>

        <v-btn-toggle v-model="ImportType" class="mt-1">
          <v-btn color="accent" flat value="pascexport">pascexport</v-btn>
          <v-btn color="accent" flat value="newkey">newkey</v-btn>
        </v-btn-toggle>
      </v-responsive>

      <v-card-text v-show="this.ImportType === 'pascexport'">
        <v-text-field
          box
          color="deep-purple"
          counter="32"
          label="Password"
          style="min-height: 96px"
          type="password"
          v-model="Pascexport_Password"
        ></v-text-field>
        <v-textarea box label="ExportedData" v-model="Pascexport_KeyData" auto-grow></v-textarea>
      </v-card-text>

      <v-card-text v-show="this.ImportType === 'newkey'">
        <v-radio-group v-model="KeyType" label="KeyType:">
          <v-radio label="secp256k1" value="ca02"></v-radio>
          <v-radio label="sect283k1" value="d902" disabled></v-radio>
          <v-radio label="sect384r1" value="cb02"></v-radio>
          <v-radio label="sect521r1" value="cc02"></v-radio>
        </v-radio-group>
      </v-card-text>

      <v-card-text>
        <v-alert :value="this.ErrorMsg != ''" type="error">
          <div v-html="ErrorMsg" style="word-break: break-all"></div>
        </v-alert>

        <v-alert :value="this.SuccessMsg != ''" type="success">
          <div v-html="SuccessMsg" style="word-break: break-all"></div>
        </v-alert>
      </v-card-text>

      <v-card-actions>      
        <v-btn block color="accent" @click="AddToKeyStore">Add to KeyStore</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";

import {  
  eCoinType,
  eKeyTypes,  
  KtlStorageWindowLocalStorage,
  CalcAccountChecksum,
  PascalPublicKey,
  CreatePrivateKeyFromPasclWalletExport,
  EcCrypto
} from "@/KTechLib/KTechLib";

@Component({})
export default class KeyGenerator extends Vue {
  ImportType: string = "pascexport";
  KeyType: eKeyTypes = eKeyTypes.SECP256K1;
  Pascexport_Password: string = "";
  Pascexport_KeyData: string = "";
  ErrorMsg: string = "";
  SuccessMsg: string = "";
  AddToKeyStore() {
    this.SuccessMsg = this.ErrorMsg = "";
    if (this.ImportType === "pascexport") {
      if (this.Pascexport_KeyData.length % 2 !== 0) {
        this.Pascexport_KeyData = "0" + this.Pascexport_KeyData;
      }

      var key = CreatePrivateKeyFromPasclWalletExport(
        this.Pascexport_KeyData,
        this.Pascexport_Password
      );

      if (key.keytype === eKeyTypes.INVALID) {
        this.ErrorMsg = "Password or keydata wrong";
        return;
      }

      let pubkkeyB58 = store.KeyManager.AddRawPrivateKey(
        key.keytype,
        key.privateKey
      );
      this.SuccessMsg = "PrivateKey added for publickey: <br>" + pubkkeyB58;
    } else if (this.ImportType === "newkey") {
      let keydata = EcCrypto.NewKeyPair(this.KeyType);

      let pubkkeyB58 = store.KeyManager.AddRawPrivateKey(
        this.KeyType,
        keydata.privateP
      );
      this.SuccessMsg = "PrivateKey added for publickey: <br>" + pubkkeyB58;
    }
  }
}
</script>


  
 
