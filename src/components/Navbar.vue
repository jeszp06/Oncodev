<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

function handleLogout() {
  auth.logout()
  mobileOpen.value = false
  router.push('/')
}
</script>

<template>
  <nav class="bg-white/95 backdrop-blur-sm border-b border-medical-100 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-9 h-9 bg-medical-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <p class="font-bold text-medical-900 text-sm leading-tight">Dr. Lisandro Márquez</p>
            <p class="text-xs text-medical-600">Urología · Oncología</p>
          </div>
        </router-link>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-6">
          <router-link to="/" class="text-sm text-medical-700 hover:text-medical-900 transition-colors">Inicio</router-link>
          <router-link to="/#servicios" class="text-sm text-medical-700 hover:text-medical-900 transition-colors">Servicios</router-link>
          <router-link to="/#sedes" class="text-sm text-medical-700 hover:text-medical-900 transition-colors">Sedes</router-link>
          <router-link to="/agendar" class="px-5 py-2 bg-medical-500 text-white text-sm font-semibold rounded-lg hover:bg-medical-600 transition-colors">Agendar Cita</router-link>

          <template v-if="auth.isLoggedIn">
            <router-link v-if="auth.isPaciente" to="/mis-citas" class="text-sm text-medical-700 hover:text-medical-900 transition-colors">Mis Citas</router-link>
            <router-link v-if="auth.isDoctor" to="/doctor" class="text-sm text-medical-700 hover:text-medical-900 transition-colors">Panel Doctor</router-link>
            <div class="flex items-center gap-2">
              <img v-if="auth.user?.foto_url" :src="auth.user.foto_url" class="w-8 h-8 rounded-full" :alt="auth.user.nombre" referrerpolicy="no-referrer" />
              <button @click="handleLogout" class="text-sm text-medical-600 hover:text-red-600 transition-colors">Salir</button>
            </div>
          </template>
          <router-link v-else to="/login" class="text-sm text-medical-600 hover:text-medical-900 transition-colors">Iniciar Sesión</router-link>
        </div>

        <!-- Mobile hamburger -->
        <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 rounded-lg hover:bg-medical-50 transition-colors">
          <svg class="w-6 h-6 text-medical-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden bg-white border-t border-medical-100 px-4 py-4 space-y-3">
      <router-link to="/" @click="mobileOpen = false" class="block text-sm text-medical-700 py-2">Inicio</router-link>
      <router-link to="/#servicios" @click="mobileOpen = false" class="block text-sm text-medical-700 py-2">Servicios</router-link>
      <router-link to="/#sedes" @click="mobileOpen = false" class="block text-sm text-medical-700 py-2">Sedes</router-link>
      <router-link to="/agendar" @click="mobileOpen = false" class="block text-center px-5 py-3 bg-medical-500 text-white text-sm font-semibold rounded-lg">Agendar Cita</router-link>

      <template v-if="auth.isLoggedIn">
        <router-link v-if="auth.isPaciente" to="/mis-citas" @click="mobileOpen = false" class="block text-sm text-medical-700 py-2">Mis Citas</router-link>
        <router-link v-if="auth.isDoctor" to="/doctor" @click="mobileOpen = false" class="block text-sm text-medical-700 py-2">Panel Doctor</router-link>
        <button @click="handleLogout" class="block w-full text-left text-sm text-red-600 py-2">Cerrar Sesión</button>
      </template>
      <router-link v-else to="/login" @click="mobileOpen = false" class="block text-sm text-medical-600 py-2">Iniciar Sesión</router-link>
    </div>
  </nav>
</template>
