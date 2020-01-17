import Vue from 'vue'
import App from './App.vue'
import router from './router'
import global from './assets/css/global.css'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'

Vue.use(ElementUi)
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'

// axios({
//   method: 'post',
//   url: '/login',
//   data: {
//     username: 'admin',
//     password: '123456'
//   }
// }).then(res => {
//   console.log(res);
// });


Vue.config.productionTip = false

new Vue({
  global,
  router,
  render: h => h(App),
}).$mount('#app')
