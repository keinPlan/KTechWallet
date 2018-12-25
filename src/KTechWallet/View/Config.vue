<template>
  <div class="md-layout">
    <v-card>
      <v-card-title>
        <div>
          <h1>RPC SERVER:</h1>

          https://keinplan1337.ddns.net:1600
        </div>
      </v-card-title>
      <v-card-text>
        <v-text-field outline v-model="RpcServer"/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="Test">test</v-btn>
        <v-btn @click="Save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { error } from "util";
import { GetAccount } from "@/KTechLib/PascalCoin/PascalCoinRpc";
import store from "@/KTechWallet/store/store";
@Component
export default class Config extends Vue {
  RpcServer: string = "https://keinplan1337.ddns.net:1600";

  mounted() {
    this.RpcServer = store.WalletConfig.RpcServer;
  }

  Save() {
    store.WalletConfig.SetRpcServer(this.RpcServer);
  }

  async Test() {
    var getacc = new GetAccount(1);
    await getacc
      .Execute(this.RpcServer)
      .then(data => (data ? alert("ok") : alert("failed")))
      .catch(error => alert(error.toString()));
  }
}
</script>

