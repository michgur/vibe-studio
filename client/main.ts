import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { vTooltip } from './tooltip'
import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: App },
  { path: '/about', component: App },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
  .directive('tooltip', vTooltip)
  .use(router)
  .mount('#app')
