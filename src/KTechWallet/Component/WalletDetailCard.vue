
<template>
  <v-card>
    <v-card-actions color="primary">
      <div>
        <h2>Account: {{this.AccountName}}</h2>
        {{this.Balance}}
        <v-icon small>attach_money</v-icon>
      </div>
      <v-spacer/>
      <v-btn color="accent" icon @click="ShowAccountsDetails=!ShowAccountsDetails">
        <v-icon>{{ShowAccountsDetails ? 'visibility' : 'visibility_off'}}</v-icon>
      </v-btn>
    </v-card-actions>

    <v-card-text v-show="ShowAccountsDetails">
      <v-text-field label="AccountName:" :value="AccountName" disabled/>
      <v-text-field
        label="AccountNumber:"
        :value="this.Account.AccountData.AccountNumber"
        :suffix="'-' + AccountCheckSum"
        disabled
        type="Number"
      />

      <v-text-field
        label="KeyType:"
        :value="this.Account.AccountData.KeyType"
        disabled
        type="Number"
      />

      <v-textarea
        label="AccountPublicKey:"
        :value="this.Account.AccountData.AccountPublicKey"
        disabled
        type="Number"
      />
      <v-text-field
        label="LastUpdate:"
        :value="this.Account.AccountData.LastUpdate"
        disabled
        type="Number"
      />
    </v-card-text>
    <v-card-actions v-show="ShowAccountsDetails">
      <v-btn>
        <v-icon>edit</v-icon>
      </v-btn>

      <v-dialog width="500">
        <v-btn slot="activator">
          <v-icon>vpn_key</v-icon>
        </v-btn>
        <!-- content -->
        <v-card>
          <v-card-text>
            <v-tabs>
              <v-tab>PascalWallet Export</v-tab>
              <v-tab-item>
                <v-textarea
                  box
                  color="deep-purple"
                  label="ExportedData"
                  type="number"
                  v-model="accountNumber"
                ></v-textarea>
                <v-text-field
                  box
                  color="deep-purple"
                  counter="32"
                  label="Password"
                  style="min-height: 96px"
                  type="password"
                  v-model="privateKeyPassword"
                ></v-text-field>
              </v-tab-item>

              <v-tab>KtechWallet Export</v-tab>
              <v-tab-item>item1</v-tab-item>
            </v-tabs>
            <v-btn block>Save</v-btn>
          </v-card-text>
        </v-card>
        <!-- content end-->
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";

import {
  KtlAccountData,
  eCoinType,
  KtlKeyStorage,
  eKeyTypes,
  KtlAccount,
  KtlStorageWindowLocalStorage,
  GetAccount,
  CalcAccountChecksum
} from "@/KTechLib/KTechLib";

@Component({ components: {} })
export default class WalletDetailCard extends Vue {
  @Prop() public AccountName!: string;
  Account!: KtlAccount | undefined;
  Balance: string = "xxx.xx";
  lastupdate: string = "";
  autorenew_loading: boolean = false;
  AccountCheckSum: number = 0;
  ShowAccountsDetails: boolean = false;
  constructor() {
    super();
    this.Account = store.AccountManager.GetAccountByName(this.AccountName);

    this.AccountCheckSum = CalcAccountChecksum(
      this.Account!.AccountData.AccountNumber
    );
  }

  mounted() {
    this.Update();
  }

  Update(forceUpdate = false) {
    if (!this.Account) {
      return;
    }
    this.autorenew_loading = true;
    this.Account.AccountData.AccountPublicKey;
    this.Balance = "???.??";

    var req = store.DataProvider.GetAccountInfo(
      this.Account.AccountData.AccountNumber,
      forceUpdate
    )
      .then(value => {
        this.Balance = value ? value.balance.toString() : "";
      })
      .catch(error => (this.Balance = error.toString()))
      .finally(() => (this.autorenew_loading = false));
  }

  DeleteWallet() {
    if (!this.Account) {
      return;
    }

    var answer = confirm("Delete Account ?");

    if (answer) {
      store.AccountManager.DeleteAccount(this.AccountName);
      this.Account = undefined;
    }
  }

  IsPascalCoin(): boolean {
    if (this.Account) {
      return this.Account.AccountData.CoinType === eCoinType.PASCAL;
    }
    return false;
  }
}
</script>


  
 
