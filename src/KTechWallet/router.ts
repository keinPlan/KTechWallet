import Vue from "vue";
import VueRouter from "vue-router";
import Home from "./View/Home.vue";
import Tools from "./View/Tools.vue";
import WalletView from "./View/WalletView.vue";
import WalletDetailView from "./View/WalletDetailView.vue";
import WalletCreateAccountView from "./View/WalletCreateAccountView.vue";
import WalletSendMoney from "./View/WalletSendMoney.vue";
import UriHandler from "./View/UriHandler.vue";
import Contacts from "./View/Contacts.vue";
import LoginForm from "./View/LoginForm.vue";


import MenuWallet from "./Component/MenuWallet.vue";
import config from "./View/Config.vue";
//import AccountsView from "./View/AccountsView.vue"; PublicKeyCheck


Vue.use(VueRouter);


export default new VueRouter({
    routes: [
        {
            path: "/",
            name: "home",
            components: {
                default: Home,
                //navbar: NavigationBar
            }
        },
        {
            path: "/config",
            name: "config",
            components: {
                default: config,
                //navbar: NavigationBar
            }
        },
        {
            path: "/wallet",
            name: "wallet",
            components: {
                default: WalletView,
                navbar: MenuWallet
            }
        },
        {
            path: "/wallet/details/:AccountName",
            name: "walletdetails",
            components: {
                default: WalletDetailView,
                //navbar: NavigationBar
            },
            props: {
                default: true,
            }
        },
        {
            path: "/wallet/send/:AccountName",
            name: "walletsend",
            components: {
                default: WalletSendMoney,
                //navbar: NavigationBar
            },
            props: {
                default: true,
            }
        },
        {
            path: "/wallet/send/",
            name: "walletsend2",
            components: {
                default: WalletSendMoney,
                //navbar: NavigationBar
            }

        },
        {
            path: "/wallet/createaccount",
            name: "walletcreateaccount",
            components: {
                default: WalletCreateAccountView,
                //navbar: NavigationBar
            }
        },
        {
            path: "/contacts",
            name: "contacts",
            components: {
                default: Contacts,
                //navbar: NavigationBar
            }

        },
        {
            path: "/tools",
            name: "Tools",
            components: {
                default: Tools,
                //navbar: NavigationBar
            }
        },
        {
            path: "/urihandler",
            name: "UriHandler",
            components: {
                default: UriHandler,
                //navbar: NavigationBar
            }
        },
        {
            path: "/login",
            name: "login",
            components: {
                default: LoginForm,
                //navbar: NavigationBar
            }
        },


    ],
});
