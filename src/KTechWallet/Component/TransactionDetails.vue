<template>
  <v-card>
    <v-card-media>
      <!-- payload -->
      <div v-if="AccountOperation.payload.length">
        <v-toolbar>
          <h2>Payload:</h2>
          <v-spacer/>Display:
          <v-btn-toggle v-model="payLoadFromat">
            <v-btn color="accent" flat value="HEX" @click="TogglePayload('HEX')">Hex</v-btn>
            <v-btn color="accent" flat value="ASCII" @click="TogglePayload('ASCII')">ASCII</v-btn>
          </v-btn-toggle>encryption:
          <v-btn-toggle v-model="encryptionFormat">
            <v-btn color="accent" flat value="NONE" @click="TogglePayload('NONE')">NONE</v-btn>
            <v-btn
              color="accent"
              flat
              value="ECDH_PASCAL"
              @click="TogglePayload('ECDH_PASCAL')"
            >ECDH_PASCAL</v-btn>

            <v-btn
              color="accent"
              flat
              value="ECDH_KTECH"
              @click="TogglePayload('ECDH_KTECH')"
            >ECDH_KTECH</v-btn>
          </v-btn-toggle>
        </v-toolbar>
        <v-textarea box v-model="payload" disabled/>
        <br>
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
          disabled
          v-model="rawOperationData"
          :rows="rawOperationDataLines"
        />
      </div>
    </v-card-media>
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
  Uint8ArrayToHex
} from "@/KTechLib/KTechLib";

@Component
export default class TransactionDetails extends Vue {
  @Prop() AccountName!: string;
  @Prop() AccountOperation!: ktl.IGetAccountOperationsResponse;
  payload: string = "";
  payLoadFromat: string = "HEX";
  encryptionFormat: string = "NONE";
  rawOperationData!: string;
  rawOperationDataLines: number = 0;
  ShowRawOperationData: boolean = false;

  mounted() {
    this.payload = this.AccountOperation.payload;
    this.rawOperationData = JSON.stringify(this.AccountOperation, null, 4);
    this.rawOperationDataLines = this.rawOperationData.split("\n").length;
    console.log(this.rawOperationDataLines);
  }

  TogglePayload(v: string) {
    if (v === "ECDH_PASCAL") {
      this.payload = this.DecodePayloadEcdhPascal(
        this.AccountOperation.payload
      );
      if (this.payLoadFromat === "HEX") {
        return;
      }
    } else if (v === "ECDH_KTECH") {
      this.payload = this.DecodePayloadEcdhKtech(this.AccountOperation.payload);

      if (this.payLoadFromat === "HEX") {
        return;
      }
    } else if (v === "NONE") {
      this.payload = this.AccountOperation.payload;
      if (this.payLoadFromat === "HEX") {
        return;
      }
    } else {
      this.payLoadFromat = v;
    }

    if (this.payLoadFromat === "HEX") {
      this.payload = StringToHexString(this.payload);
    } else {
      this.payload = HexStringToAsciiString(this.payload);
    }
  }

  DecodePayloadEcdhPascal(payload: string): string {
    let reader = new BinaryReaderWriter(
      Uint8ArrayFromHex(this.AccountOperation.payload)
    );

    if (reader.buffer.length < 6) {
      return "inputData != EcdhPascal Fromat";
    }

    let publicKeyLen = reader.ReadByte();
    let macLen = reader.ReadByte();
    let orgMsgLen = reader.ReadUInt16();
    let encMsgLen = reader.ReadUInt16();

    if (
      macLen != 0x10 ||
      orgMsgLen === 0 ||
      encMsgLen < 16 ||
      reader.buffer.length !== publicKeyLen + macLen +  encMsgLen + 6
    ) {
      return "inputData != EcdhPascal Fromat";
    }

    let pubkey = reader.ReadBytes(publicKeyLen);
    let mac = reader.ReadBytes(macLen);
    let msg = reader.ReadBytes(encMsgLen);

    var password = prompt("Please enter password for privateKey");

    if (!password) {
      this.encryptionFormat = "NONE";
      return "failed!!!";
    }

    let acc = store.AccountManager.GetAccountByName(this.AccountName);

    let orgMsg = acc!.AccountData.EncryptedPrivateKey.ECDHDecrypt(
      acc!.AccountData.KeyType,
      password,
      msg,
      pubkey
    );

    return Uint8ArrayToHex(orgMsg);
  }

  DecodePayloadEcdhKtech(payload: string): string {
    let reader = new BinaryReaderWriter(
      Uint8ArrayFromHex(this.AccountOperation.payload)
    );

    if (reader.buffer.length < 2) {
      return "inputData != EcdhPascal Fromat";
    }

    let publicKeyLen = reader.ReadByte();
    let msgLen = reader.ReadByte();
    
    if (reader.buffer.length !== 2 + publicKeyLen + msgLen) {
      return "inputData != EcdhPascal Fromat";
    }

    let pubkey = reader.ReadBytes(publicKeyLen);
    let msg = reader.ReadBytes(msgLen);

    var password = prompt("Please enter password for privateKey");

    if (!password) {
      this.encryptionFormat = "NONE";
      return "Failed";
    }

    let acc = store.AccountManager.GetAccountByName(this.AccountName);

    let orgMsg = acc!.AccountData.EncryptedPrivateKey.ECDHDecrypt(
      acc!.AccountData.KeyType,
      password,
      msg,
      pubkey
    );

    return Uint8ArrayToHex(orgMsg);
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

 