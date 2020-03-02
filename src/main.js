import Vue from 'vue'
import App from './App.vue'
import router from './router'
import global from './assets/css/global.css'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

Vue.use(ElementUi)
Vue.prototype.$axios = axios

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
axios.interceptors.request.use(config => {
  config.headers.authorization = window.sessionStorage.getItem('token')
  return config
})



Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
  global,
  router,
  render: h => h(App),
}).$mount('#app')
