
<template>
  <v-card>
    <v-responsive color="primary">
      <v-toolbar>
        <div>
          <h2>Account: {{this.AccountName}}</h2>
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
      <v-text-field label="AccountName:" :value="AccountName" disabled/>
      <v-text-field
        prepend-icon="edit"
        @click:prepend="ChangeAccNumber"
        label="AccountNumber:"
        :value="this.Account.AccountData.AccountNumber"
        :suffix="'-' + AccountCheckSum"
        readonly
        type="Number"
      />

      <v-text-field label="KeyType:" :value="this.Account.AccountData.KeyType" readonly/>

      <v-textarea
     auto-grow
        label="AccountPublicKey:"
        :value="this.Account.AccountData.AccountPublicKey"
        readonly         
        type="Number"
      />
      <v-text-field
        label="LastUpdate:"
        :value="this.Account.AccountData.LastUpdate"
        readonly
        type="Number"
      />
    </v-card-text>
    <v-card-actions v-show="ShowAccountsDetails">
      <v-btn>
        <v-icon>edit</v-icon>
      </v-btn>

      <!-- pk dialog -->
      <v-dialog width="500" >
        <v-btn slot="activator">
          <v-icon>vpn_key</v-icon>
        </v-btn>

        <v-card>
          <v-card-text>
                        <v-text-field
              box
              color="deep-purple"
              counter="32"
              label="Password"
              style="min-height: 96px"
              type="password"
              v-model="PrivateKeyPassword"
            ></v-text-field>

            <v-btn @click="DecryptPrivateKey">Decrypt</v-btn> 
            <v-btn @click="ClearResult">ClearResult
            </v-btn>
            <v-textarea
              box
              color="deep-purple"
              label="ExportedData"
              type="number"
              v-model="PrivateKey"
            ></v-textarea>

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
  CalcAccountChecksum,
  PascalPublicKey,
  Uint8ArrayToHex
} from "@/KTechLib/KTechLib";

@Component({ components: {} })
export default class WalletDetailCard extends Vue {
  @Prop() public AccountName!: string;
  Account!: KtlAccount | undefined;
  Balance: string = "xxx.xx";
  lastupdate: string = "";
  AccountCheckSum: number = 0;
  ShowAccountsDetails: boolean = true;

  PrivateKeyPassword: string = "";
  PrivateKey: string = "";

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
  }

  ChangeAccNumber() {
    let input = prompt("Insert New AccountNumber");

    if (input) {
      this.Account!.AccountData.AccountNumber = Number.parseInt(input);
    }
  }

  DecryptPrivateKey() {
    let pk = this.Account!.AccountData.EncryptedPrivateKey.UnPackKey(
      this.PrivateKeyPassword
    );
    let PK = PascalPublicKey.CreateFromPrivateKey(
      this.Account!.AccountData.KeyType,
      pk
    );

    if (this.Account!.AccountData.AccountPublicKey !== PK.EncodeBase58()) {
      this.PrivateKey = "Wrong Password";
    } else {
      this.PrivateKey = Uint8ArrayToHex(pk);
    }
  }

  ClearResult(){
    this.PrivateKey ="";
    this.PrivateKeyPassword ="";
  }
}
</script>


  
 
