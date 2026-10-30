<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const showDoctorLogin = ref(false)
const doctorUsername = ref('')
const doctorPassword = ref('')
const errorMsg = ref('')
const loading = ref(false)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function redirectAfterLogin() {
  const redirect = route.query.redirect || (auth.isDoctor ? '/doctor' : '/mis-citas')
  router.push(redirect)
}

onMounted(() => {
  if (auth.isLoggedIn) {
    redirectAfterLogin()
    return
  }

  if (GOOGLE_CLIENT_ID && window.google) {
    initGoogle()
  } else if (GOOGLE_CLIENT_ID) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = initGoogle
    document.head.appendChild(script)
  }
})

function initGoogle() {
  if (!window.google) return
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCallback,
  })
  window.google.accounts.id.renderButton(
    document.getElementById('google-signin-btn'),
    { theme: 'outline', size: 'large', width: 320, text: 'continue_with', locale: 'es' }
  )
}

async function handleGoogleCallback(response) {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.loginWithGoogle(response.credential)
    redirectAfterLogin()
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleDoctorLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.loginClassic(doctorUsername.value, doctorPassword.value)
    redirectAfterLogin()
  } catch (e) {
    errorMsg.value = e.data?.mensaje || e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] bg-gradient-to-b from-medical-50 to-white flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-sm border border-medical-100 p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-medical-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-medical-900">Iniciar Sesión</h1>
          <p class="text-sm text-medical-600 mt-1">Ingrese para agendar y gestionar sus citas</p>
        </div>

        <!-- Google Sign In -->
        <div v-if="GOOGLE_CLIENT_ID" class="mb-6">
          <div id="google-signin-btn" class="flex justify-center"></div>
        </div>
        <div v-else class="mb-6 text-center text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
          Google Sign-In no está configurado. Contacte al administrador.
        </div>

        <p v-if="errorMsg" class="text-red-600 text-sm text-center mb-4 bg-red-50 rounded-lg p-3">{{ errorMsg }}</p>

        <!-- Separador -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
          <div class="relative flex justify-center text-xs"><span class="bg-white px-3 text-gray-400">Acceso Médico</span></div>
        </div>

        <!-- Doctor/Admin Login toggle -->
        <button
          @click="showDoctorLogin = !showDoctorLogin"
          class="w-full text-center text-sm text-medical-600 hover:text-medical-800 transition-colors mb-4"
        >
          {{ showDoctorLogin ? 'Ocultar' : 'Acceso para personal médico' }}
        </button>

        <form v-if="showDoctorLogin" @submit.prevent="handleDoctorLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input v-model="doctorUsername" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none" placeholder="admin" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input v-model="doctorPassword" type="password" required class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" :disabled="loading" class="w-full py-3 bg-medical-800 text-white font-semibold rounded-xl hover:bg-medical-900 transition-colors disabled:opacity-50">
            {{ loading ? 'Ingresando...' : 'Ingresar como Médico' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
