import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

import HomePage from '../views/HomePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/agendar', name: 'booking', component: () => import('../views/BookingPage.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginPage.vue') },
  {
    path: '/mis-citas',
    name: 'my-appointments',
    component: () => import('../views/PatientDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor',
    name: 'doctor',
    component: () => import('../views/DoctorDashboard.vue'),
    meta: { requiresAuth: true, requiresDoctor: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }
  if (to.meta.requiresDoctor && !auth.isDoctor) {
    return next({ name: 'home' })
  }
  next()
})

export default router
