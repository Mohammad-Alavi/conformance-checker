/**
 * Vue Router configuration
 * Handles navigation between Conformance Checker and Rules Management
 */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'Conformance AI - Validation Engine',
    },
  },
  {
    path: '/rules',
    name: 'rules',
    component: () => import('@/views/RulesView.vue'),
    meta: {
      title: 'Rules Management - Conformance AI',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Update document title on navigation
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Conformance AI'
  next()
})

export default router
