import Vue from 'vue'
import App from './App.vue'
import router from './router'
import global from './assets/css/global.css'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'


Vue.use(ElementUi)
Vue.use(VueQuillEditor)
Vue.prototype.$axios = axios



axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'

//在request 拦截器中，展示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.authorization = window.sessionStorage.getItem('token')
  return config
})

//在response 拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})


Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
Vue.filter('dateFormat', function (originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDay() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  global,
  router,
  render: h => h(App),
}).$mount('#app')
