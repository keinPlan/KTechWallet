
<template>
  <v-card>
    <v-responsive color="primary">
      <v-toolbar>
        <div>
          <h2>Account: {{WalletName}}</h2>
          {{this.Balance}}
          <v-icon small>attach_money</v-icon>
        </div>
        <v-spacer/>
        <v-btn color="accent" icon @click="ShowAccountsDetails=!ShowAccountsDetails">
          <v-icon>{{ShowAccountsDetails ? 'visibility' : 'visibility_off'}}</v-icon>
        </v-btn>
      </v-toolbar>
    </v-responsive>

    <v-card-text v-show="ShowAccountsDetails">
      <v-text-field label="AccountName:" :value="WalletName" disabled/>
      <v-text-field
        prepend-icon="edit"
        @click:prepend="ChangeAccNumber"
        label="AccountNumber:"
        :value="this.Wallet.AccountNumber"
        :suffix="'-' + AccountCheckSum"
        readonly
        type="Number"
      />
      <!-- 
      <v-text-field label="KeyType:" :value="this.WalletName.AccountData.KeyType" readonly/>
      -->
      <v-textarea
        auto-grow
        label="AccountPublicKey:"
        :value="this.Wallet.PublicKey"
        readonly
        type="Number"
      />
      <v-text-field label="LastUpdate:" :value="this.Wallet.LastUpdate" readonly type="Number"/>
    </v-card-text>
    <v-card-actions v-show="ShowAccountsDetails">
      <v-btn>
        <v-icon>edit</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
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
  Uint8ArrayToHex,
  KtlWallet
} from "@/KTechLib/KTechLib";

@Component({ components: {} })
export default class WalletDetailCard extends Vue {
  @Prop() public WalletName!: string;
  Wallet!: KtlWallet | undefined;
  Balance: string = "xxx.xx";
  lastupdate: string = "";
  AccountCheckSum: number = 0;
  ShowAccountsDetails: boolean = true;

  PrivateKeyPassword: string = "";
  PrivateKey: string = "";

  constructor() {
    super();
    this.Wallet = store.WalletManager.GetWalletByName(this.WalletName);

    this.AccountCheckSum = CalcAccountChecksum(this.Wallet!.AccountNumber);
  }

  mounted() {
    this.Update();
  }

  Update(forceUpdate = false) {
    if (!this.Wallet) {
      return;
    }

    this.Wallet.PublicKey;
    this.Balance = "???.??";

    var req = store.DataProvider.GetAccountInfo(
      this.Wallet.AccountNumber,
      forceUpdate
    )
      .then(value => {
        this.Balance = value ? value.balance.toString() : "";
        this.Wallet!.PublicKey = value
          ? PascalPublicKey.CreateFromEncPublicKey(
              value.enc_pubkey
            ).EncodeBase58()
          : "";
      })
      .catch(error => (this.Balance = error.toString()));
  }

  ChangeAccNumber() {
    let input = prompt("Insert New AccountNumber");

    if (input) {
      this.Wallet!.AccountNumber = Number.parseInt(input);
      this.Update(true);
      store.WalletManager.Save();
    }
  }
}
</script>


  
 
