<template>
  


    <!-- add contacts dialog-->
    <v-dialog lazy max-width="400px" persistent v-model="Show">   
      <v-card>
        <v-responsive>
          <v-toolbar>
            <h2>KeyManager unlock</h2>
          </v-toolbar>
        </v-responsive>
        <v-card-text>
          <v-text-field
            box
            v-model="UnlockKeymanagerPassword"
            label="Password"
            type="password"
            ref="inputbox"
            :error="Error != ''"
            :error-messages="Error"
            required 
            v-on:keypress.enter="Unlock"         
          />
          <v-btn color="accent" block @click="Unlock()">
            <v-icon>lock_open</v-icon>
          </v-btn>

          <v-btn color="primary" block @click="$emit('Show', false)">Close</v-btn>


        
        </v-card-text>
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
  Emit,
Watch
} from "vue-property-decorator";

import store from "../store/store";

import { IKtlContact, CalcAccountChecksum } from "@/KTechLib/KTechLib";

@Component
export default class UnlockKeysDialog extends Vue {
  @Model("Show") Show: boolean = false;
  UnlockKeymanagerPassword: string = "";
  Error: string = "";
  e :boolean=false;
  @Watch("Show")
  changed( ){
     if (this.Show){
       this.$nextTick(() => (this.$refs.inputbox as any) .focus())
     
     }
  }

  Unlock() {
    this.e=!this.e;
    if (store.KeyManager.IsLocked) {
      this.Error = store.KeyManager.Unlock(this.UnlockKeymanagerPassword);
      if (this.Error === "") {
        this.UnlockKeymanagerPassword = "";
        this.$emit("Show", false);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

