import { createApp } from 'vue'
import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'

import '@/style.css'
import App from '@/App.vue'
import Layout from '@/Layout.vue'
import { vTooltip } from '@/directives/tooltip'
import ContactsPage from '@/pages/ContactsPage.vue'
import CallPage from '@/pages/CallPage.vue'
import ReportBuilderPage from '@/pages/ReportBuilderPage.vue'
import TestPage from '@/pages/TestPage.vue'
import { ALL_AGENTS } from '@shared/agents'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: `/${ALL_AGENTS[0]}` },
  {
    path: '/:agent',
    component: Layout,
    props: true,
    children: [
      { path: '', redirect: to => `${to.params.agent}/contacts` },
      { path: 'contacts', component: ContactsPage },
      { path: 'calls', component: CallPage },
      { path: 'reports', component: ReportBuilderPage },
      { path: 'test', component: TestPage },
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
