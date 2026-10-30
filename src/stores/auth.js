import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/client.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isDoctor = computed(() => user.value?.rol === 'doctor' || user.value?.rol === 'administrador')
  const isPaciente = computed(() => user.value?.rol === 'paciente')

  async function loginWithGoogle(credential) {
    loading.value = true
    try {
      const data = await api.post('/api/auth/google', { credential })
      token.value = data.token
      user.value = data.usuario
      localStorage.setItem('token', data.token)
      return data
    } finally {
      loading.value = false
    }
  }

  async function loginClassic(username, password) {
    loading.value = true
    try {
      const data = await api.post('/api/login', { username, password })
      token.value = data.token
      localStorage.setItem('token', data.token)
      await fetchProfile()
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const data = await api.get('/api/auth/me')
      user.value = data.usuario
    } catch (e) {
      if (e.status === 401) logout()
    }
  }

  async function updateProfile(datos) {
    const data = await api.put('/api/auth/perfil', datos)
    await fetchProfile()
    return data
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  async function init() {
    if (token.value) await fetchProfile()
  }

  return { user, token, loading, isLoggedIn, isDoctor, isPaciente, loginWithGoogle, loginClassic, fetchProfile, updateProfile, logout, init }
})
