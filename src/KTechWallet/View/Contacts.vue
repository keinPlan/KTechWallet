<template>
  <div>
    <v-card><h1>TODO</h1>
   
    </v-card>
    <v-layout align-center justify-center wrap row>
      <v-card width="350px">
        <v-card-title>
          <div>
            <h3 class="headline mb-0">KTechDev</h3>606554-60
            <br>
          </div>
          <v-spacer/>
          <div>
            <v-chip class="font-weight-bold title" label>0.00000
              <v-icon right color="accent">attach_money</v-icon>
            </v-chip>
          </div>
        </v-card-title>

        <v-toolbar flat>
          <v-btn icon color="accent" v-show="false">
            <v-icon>notification_important</v-icon>
          </v-btn>
          <v-btn icon color="error" v-show="false">
            <v-icon>warning</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>delete</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>info</v-icon>
          </v-btn>

          <v-btn icon>
            <v-icon>send</v-icon>
          </v-btn>
          <v-btn icon @click="Update" :loading="autorenew_loading">
            <v-icon>autorenew</v-icon>
          </v-btn>
        </v-toolbar>
      </v-card>
   
    </v-layout>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";



@Component({})
export default class Contacts extends Vue {

}
</script>

 

