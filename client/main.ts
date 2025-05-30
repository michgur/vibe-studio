import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Layout from './Layout.vue'
import { vTooltip } from './tooltip'
import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import ContactsPage from './components/ContactsPage.vue'
import CallPage from './components/CallPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/:agent',
    component: Layout,
    props: true,
    children: [
      { path: '', component: ContactsPage },
      { path: 'call', component: CallPage },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App)
  .directive('tooltip', vTooltip)
  .use(router)
  .mount('#app')
