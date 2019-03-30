import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/KTech/View/Home.vue";
import Tools from "@/KTech/View/Wallet/Tools.vue";
import WalletView from "@/KTech/View/Wallet/WalletManager.vue";
import WalletDetailView from "@/KTech/View/Wallet/WalletDetailView.vue";
import WalletSendMoney from "@/KTech/View/Wallet/WalletSendMoney.vue";
import UriHandler from "@/KTech/View/UriHandler.vue";
import Contacts from "@/KTech/View/Wallet/ContactManager.vue";
import LoginForm from "@/KTech/View/Wallet/LoginForm.vue";
import KeyManager from "@/KTech/View/Wallet/KeyManager.vue";
import config from "@/KTech/View/Wallet/ConfigManager.vue";
import wallet from "@/KTech/View/Wallet.vue";

import Welcome from "@/KTech/View/Welcome.vue";

import { Component } from "vue-property-decorator";



Vue.use(VueRouter);


export default new VueRouter({
    routes: [
        {
            path: "/",
            redirect: "/wallet"
            //component: WalletView
        },
        {
            path: "/wallet",
            name: "wallet",
            component: wallet,
            children: [
                {
                    path: "/",
                    redirect: "/WalletView"
                    //component: WalletView
                },
                {
                    path: "/keymanager",
                    component: KeyManager
                }, {
                    path: "/config",
                    component: config
                }, {
                    path: "/WalletView",
                    component: WalletView
                }, {
                    path: "/WalletView/:WalletName",
                    name:"walletInfo",
                    component: WalletDetailView,
                    props: true
                }, {
                    name:"walletSend",
                    path: "/WalletView/send/:WalletName",
                    component: WalletSendMoney,
                    props: true
                }
                , {
                    path: "/contacts",
                    name: "contacts",
                    component: Contacts,
                    //props: true
                }
                , {
                    path: "/tools",
                    name: "tools",
                    component: Tools,
                    //props: true
                }]

        }, 
        {
            path: "/urihandler",
            name: "UriHandler",
            components: {
                default: UriHandler,
            }
        },
    ],
});
