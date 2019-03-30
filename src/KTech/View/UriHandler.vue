<template>
  <div>
    {{uri}}
    <div v-for="test in Array.from(this.uriParameterMap.entries())" :key="test[0]">{{test}}</div>
    <br>
    <br>
    {{error}}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import WalletInfo from "@/KTechWallet/Component/WalletInfo.vue";


@Component
export default class UriHandler extends Vue {
  uri: string = "";
  error: string = "";
  uriParameterMap: Map<string, string> = new Map<string, string>();
  created() {
    try {
      let uri = this.$route.query["q"] as string;
      this.uri = uri;

      if (uri.indexOf("pasc://") === -1) {
        this.error = "start not ok";
        return;
      }

      uri = uri.slice(uri.indexOf("pasc://") +7).replace(new RegExp("/", "g"), "");

      let split = uri.split("&");

      split.forEach(v => {
        let temp = v.split("=");
        if (temp.length == 1) {
          this.uriParameterMap.set(temp[0], "");
        } else if (temp.length == 2) {
          this.uriParameterMap.set(temp[0], temp[1]);
        }
      });

      if (this.uriParameterMap.get("action") === "login") {
        let accountid = this.uriParameterMap.get("accountid");
        let challenge = this.uriParameterMap.get("challenge");
        let callback = this.uriParameterMap.get("callback");
        let publickey = this.uriParameterMap.get("publickey");

        if (!callback || !challenge || !accountid) {
          this.error = "login parameter missing";
          return;
        }

        this.$router.replace(
          "/login?accountid=" +
            accountid +
            "&challenge=" +
            challenge +
            "&publickey=" +
            publickey +
            "&callback=" +
            callback
        );
      }

      if (this.uriParameterMap.get("action") === "pay") {
        let link = "/WalletView/send/x?";
        let data: string = "";
        if (this.uriParameterMap.get("amount")) {
          data += "amount=" + this.uriParameterMap.get("amount") + "&";
        }

        if (this.uriParameterMap.get("target")) {
          data += "target=" + this.uriParameterMap.get("target") + "&";
        }

        if (this.uriParameterMap.get("payload")) {
          data += "payload=" + this.uriParameterMap.get("payload") + "&";
        }

        if (this.uriParameterMap.get("payloaddisplay")) {
          data +=
            "payloaddisplay=" +
            this.uriParameterMap.get("payloaddisplay") +
            "&";
        }

        if (this.uriParameterMap.get("label")) {
          data += "label=" + this.uriParameterMap.get("label") + "&";
        }

        if (
          !this.uriParameterMap.get("target") ||
          !this.uriParameterMap.get("amount")
        ) {
          this.error = "pay require a target and amount";
          return;
        }
        this.$router.replace(link + data);
      }
    } catch (error) {
      this.error = error;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

