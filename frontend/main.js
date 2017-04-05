import Vue from 'vue'
import App from './components/App.vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import router from './utils/router.js'
import store from './utils/store.js'
import es_AR from './locales/es_AR'
import en from './locales/en'

Vue.use(VueI18n)
Vue.config.lang = 'es_AR'
Vue.locale('es_AR', es_AR)
Vue.locale('en', en)
Vue.use(VueResource)
Vue.use(VueRouter)

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
