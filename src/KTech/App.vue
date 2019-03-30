<template>
  <v-app :dark="dark" >

        
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import {} from "@/KTechLib/KTechLib";

@Component
export default class App extends Vue {
   dark: boolean = true;
}
</script>






<style>

.v-card {
  margin: 5px;
  border-radius: 5px;
}


.v-btn--icon {
  border-radius:  2px!important;  
}

.v-btn--icon::before {
  border-radius:  2px!important; 
}
.v-btn--active {
  opacity: 1 !important;
  background-color:#FF6D00 !important;
  color: black !important;
 
}

::before, ::after{
      text-decoration-color:black !important;
}
</style>