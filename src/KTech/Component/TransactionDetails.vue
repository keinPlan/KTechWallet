<template>
  <v-card>
    <v-responsive>
      <!-- payload -->
      <div v-if="AccountOperation.payload.length">
        <v-toolbar>
          <h2>Payload:</h2>
        </v-toolbar>
        <div class="pt-1 pb-1">
          Display:
          <v-btn-toggle flat class="mr-3" mandatory>
            <v-btn flat value="HEX" @click="()=>{payLoadFromat='HEX'; UpdatePayload()}">Hex</v-btn>
            <v-btn flat value="ASCII" @click="()=>{payLoadFromat='ASCII'; UpdatePayload()}">ASCII</v-btn>
          </v-btn-toggle>
        </div>

        <div class="pt-1 pb-1">
          Encryption:
          <v-btn-toggle mandatory>
            <v-btn flat value="NONE" @click="()=>{encryptionFormat='NONE'; UpdatePayload()}">NONE</v-btn>
            <v-btn
              flat
              value="ECDH_PASCAL"
              @click="()=>{encryptionFormat='ECDH_PASCAL'; UpdatePayload()}"
            >ECDH_PASCAL</v-btn>

            <v-btn
              flat
              value="ECDH_KTECH"
              @click="()=>{encryptionFormat='ECDH_KTECH'; UpdatePayload()}"
            >ECDH_KTECH</v-btn>
          </v-btn-toggle>
        </div>

        <v-textarea box auto-grow readonly v-model="payload"/>
      </div>

      <!-- AccountOperation -->
      <div>
        <v-toolbar>
          <h2>RawOperationData:</h2>
          <v-spacer/>
          <v-btn color="accent" icon @click="ShowRawOperationData=!ShowRawOperationData">
            <v-icon>{{ShowRawOperationData ? 'visibility' : 'visibility_off'}}</v-icon>
          </v-btn>
        </v-toolbar>
        <v-textarea
          v-show="ShowRawOperationData"
          box
          readonly
          :value="ShowRawOperationData? rawOperationData:''"
          auto-grow
        />
      </div>
    </v-responsive>
  </v-card>
</template>



<script lang="ts">
import { Component, Prop, Provide, Vue, Model } from "vue-property-decorator";
import store from "../store/store";
import * as ktl from "@/KtechLib/KtechLib";
import {
  HexStringToAsciiString,
  StringToHexString,
  BinaryReaderWriter,
  Uint8ArrayFromHex,
  Uint8ArrayToHex,
  PascalPublicKey
} from "@/KTechLib/KTechLib";

@Component
export default class TransactionDetails extends Vue {
  @Prop() AccountOperation!: ktl.IGetAccountOperationsResponse;
  payload: string = "";
  payLoadFromat: string = "HEX";
  encryptionFormat: string = "NONE";
  rawOperationData!: string;

  ShowRawOperationData: boolean = false;

  created() {
    this.payload = this.AccountOperation.payload;
    this.rawOperationData = JSON.stringify(this.AccountOperation, null, 4);
  }

  UpdatePayload() {
    if (this.encryptionFormat === "ECDH_PASCAL") {
      this.DecodePayloadEcdhPascal();
      return;
    } else if (this.encryptionFormat === "ECDH_KTECH") {
      this.DecodePayloadEcdhKtech();
      return;
    } else if (this.encryptionFormat === "NONE") {
      this.DisplayPayload(this.AccountOperation.payload);
    }
  }

  DisplayPayload(payload: string) {
    if (this.payLoadFromat === "HEX") {
      this.payload = payload;
    } else {
      this.payload = HexStringToAsciiString(payload);
    }
  }

  DecodePayloadEcdhPascal(): void {
    let reader = new BinaryReaderWriter(
      Uint8ArrayFromHex(this.AccountOperation.payload)
    );

    if (reader.buffer.length < 6) {
      this.payload = "inputData != EcdhPascal Fromat";
      return;
    }

    let publicKeyLen = reader.ReadByte();
    let macLen = reader.ReadByte();
    let orgMsgLen = reader.ReadUInt16();
    let encMsgLen = reader.ReadUInt16();

    if (
      macLen != 0x10 ||
      orgMsgLen === 0 ||
      encMsgLen < 16 ||
      reader.buffer.length !== publicKeyLen + macLen + encMsgLen + 6
    ) {
      this.payload = "inputData != EcdhPascal Fromat";
      return;
    }

    let sharedPublicKey = reader.ReadBytes(publicKeyLen);
    let mac = reader.ReadBytes(macLen);
    let msg = reader.ReadBytes(encMsgLen);

    store.DataProvider.GetAccountInfo(this.AccountOperation.account)
      .then(accountInfo => {
        let publickey = PascalPublicKey.CreateFromEncPublicKey(
          accountInfo.enc_pubkey
        );

        let orgMsg = store.KeyManager.ECDHDecrypt(
          publickey.EncodeBase58(),
          msg,
          sharedPublicKey
        );

        this.DisplayPayload(Uint8ArrayToHex(orgMsg));
      })
      .catch(error => {
        this.payload = "ERROR: " + JSON.stringify(error);
      });
  }

  DecodePayloadEcdhKtech(): void {
    let reader = new BinaryReaderWriter(
      Uint8ArrayFromHex(this.AccountOperation.payload)
    );

    if (reader.buffer.length < 2) {
      this.payload = "inputData != EcdhPascal Fromat";
      return;
    }

    let publicKeyLen = reader.ReadByte();
    let msgLen = reader.ReadByte();

    if (reader.buffer.length !== 2 + publicKeyLen + msgLen) {
      this.payload = "inputData != EcdhPascal Fromat";
      return;
    }

    let sharedPublicKey = reader.ReadBytes(publicKeyLen);
    let msg = reader.ReadBytes(msgLen);

    let promise = store.DataProvider.GetAccountInfo(
      this.AccountOperation.account
    )
      .then(accountInfo => {
        let publickey = PascalPublicKey.CreateFromEncPublicKey(
          accountInfo.enc_pubkey
        );

        let orgMsg = store.KeyManager.ECDHDecrypt(
          publickey.EncodeBase58(),
          msg,
          sharedPublicKey
        );

        this.DisplayPayload(Uint8ArrayToHex(orgMsg));
      })
      .catch(error => {
        this.payload = "ERROR: " + JSON.stringify(error);
      });
  }

  OpTypeToName(): string {
    switch (this.AccountOperation.optype) {
      case 1:
        return "Transaction";
      case 2:
        return "ChangeKey";
      case 3:
        return "Recover funds";
      case 4:
        return "List account for sale";
      case 5:
        return "Delist account";
      case 6:
        return "Buy account";
      case 7:
        return "ChangeKeySigned";
      case 8:
        return "Change account info";
      case 9:
        return "MultiOperation";
      case 10:
        return "Op Data";
      default:
        return "unknown OperationType";
    }
  }
}
</script>

 