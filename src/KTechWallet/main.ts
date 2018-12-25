import Vue from "vue";
import App from "./App.vue";


import router from "./router";
import store from "./store/store";




// import "vuetify/src/stylus/main.styl";
 import "./main.styl";

import Vuetify from "vuetify";
Vue.use(Vuetify, {
    iconfont: "md",
    theme: {
        background:"#c0c0c0",
        primary: "#607D8B",
        secondary: "#FF8F00",
        accent: "#FF6D00",
        error: "#f44336",
        warning: "#ffeb3b",
        info: "#2196f3",
        success: "#4caf50"
    },

});


let vue: Vue = new Vue({
    router,
    render: h => h(App)
}).$mount("#app");






