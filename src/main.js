// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import axios from 'axios'
import utils from '@/utils'
import '@/services/websocketService/data'
import config from '@/config/'



import Vue from 'vue'
import App from './App'
import router from './router'
const isMicromessenger = config.isMicromessenger
if (process.env.NODE_ENV !== 'development' || isMicromessenger) {
    const VConsole = require('vconsole');
    const vclg = new VConsole();
}
Vue.config.productionTip = false;

/**
 * 注入全局变量
 * */
Vue.http = Vue.prototype.$http = axios;

/**
 * 注入混淆
 * */
Vue.use(utils)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
