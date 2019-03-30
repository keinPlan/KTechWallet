<template>
  <div class="md-layout">
    <v-card>
      <v-card-title>
        <div>
          <h1>RPC SERVER:</h1>https://keinplan1337.acedns.org:1600
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

    <v-card>
      <v-card-title>
        <div>
          <h1>RegisterUriHandler</h1>
        </div>
      </v-card-title>

      <v-card-actions>
        <v-btn block color="primary" @click="RegisterHandler">RegisterUriHandler (web+pasc:)</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RpcGetAccount } from "@/KTechLib/PascalCoin/PascalCoinRpc";
import store from "@/KTech/store/store";
@Component
export default class ConfigManager extends Vue {
  RpcServer: string = "https://keinplan1337.acedns.org:1600";

  mounted() {
    this.RpcServer = store.WalletConfig.RpcServer;
  }

  Save() {
    store.WalletConfig.SetRpcServer(this.RpcServer);
  }

  async Test() {
    var getacc = new RpcGetAccount(1);
    await getacc
      .Execute(this.RpcServer)
      .then(data => (data ? alert("ok") : alert("failed")))
      .catch(error => alert(error.toString()));
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

