<template>
  <v-layout wrap row>
    <div>
      <v-btn
        color="primary"
        @click="ShowAddKeyDialog = !ShowAddKeyDialog "
        :disabled="this.keymanager.IsLocked"
        slot="activator"
      >
        <v-icon>add</v-icon>Add Key
      </v-btn>
      <span v-if="keymanager.IsLocked"> >>> Unlock wallet to add keys !!</span>
    </div>
    <v-dialog max-width="400px" v-model="ShowAddKeyDialog">
      <KeyGenerator/>
    </v-dialog>
    <!--  init keymanager -->
    <v-card v-if="!keymanager.InitDone()">
      <v-responsive>
        <v-toolbar>
          <h2>Init Key Manager</h2>
        </v-toolbar>
      </v-responsive>
      <v-card-text>
        The password will be used to encrypt your privateKeys so better use a good one !!!
        <v-form>
          <v-text-field v-model="password1" label="Password" type="password"/>
          <v-text-field v-model="password2" label="Password" type="password"/>

          <v-alert type="error" :value="error != ''">{{error}}</v-alert>
          <v-btn block @click="InitKeyManager">Save</v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- keymanager keys -->
    <v-flex xs12 v-for="(publickey) in publicKeys" :key="publickey">
      <v-card>
        <v-card-text>
          <v-textarea auto-grow :value="publickey" label="publickey" rows="1" readonly></v-textarea>
        </v-card-text>
        <v-card-text
          v-for="walletName in GetAffectedWallets(publickey)"
          :key="walletName"
        >{{walletName}}</v-card-text>

        <v-card-actions>
          <v-btn icon @click="Delete(publickey)">
            <v-icon>delete</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>edit</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from "vue-property-decorator";
import KeyGenerator from "@/KTech/Component/KeyGenerator.vue";
import store from "@/KTech/store/store";
import * as ktl from "@/KTechLib/KTechLib";
import { 
  eKeyTypes,
  RNG,
  KtlWalletManager,
KtlKeyManager
} from "@/KTechLib/KTechLib";

@Component({
  components: { KeyGenerator }
})
export default class KeyManager extends Vue {
  keymanager: KtlKeyManager = store.KeyManager;
  walletManager: KtlWalletManager = store.WalletManager;
  password1: string = "";
  password2: string = "";
  error: string = "";
  publicKeys: string[] = this.keymanager.GetPublicKeys;

  InitKeyManager() {
    store.KeyManager.GetPublicKeys.length;
    this.error = "";
    if (this.password1.length < 1) {
      this.error = "Enter Password !!!";

      return;
    }

    if (this.password1 !== this.password2) {
      this.error = "passwords don't match";
      return;
    }

    this.keymanager.InitWithPassword(this.password1);
    this.password1 = this.password2 = "";
  }

  GetAffectedWallets(publickey: string): string[] {
    return this.walletManager.GetWalletNames().filter(walletName => {
      return (
        this.walletManager.GetWalletByName(walletName)!.PublicKey === publickey
      );
    });
  }

  Delete(publicKey: string) {
    this.keymanager.Delete(publicKey);
    this.publicKeys = this.keymanager.GetPublicKeys;
  }
  ShowAddKeyDialog: boolean = false;
  @Watch("ShowAddKeyDialog") test2(value: boolean) {
    console.log(value);
    if (!value) {
      this.publicKeys = this.keymanager.GetPublicKeys;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

