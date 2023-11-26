import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI, {
  size: 'mini',
})

// init CRUD
import CRUD from 'cruda-element-ui'
import { initCRUD } from './cruda.config.js'
initCRUD(CRUD)

// Install Cruda
Vue.use(CRUD, { request: axios })

// Mock data
import './mock.js'

new Vue({
  el: '#app',
  render: (h) => h(App)
})
