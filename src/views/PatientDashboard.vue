<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { api } from '../api/client.js'

const auth = useAuthStore()
const proximas = ref([])
const historial = ref([])
const notificaciones = ref([])
const loading = ref(true)
const tab = ref('proximas')

const cancelModal = ref(null)
const cancelMotivo = ref('')
const reprogramarModal = ref(null)
const nuevaFecha = ref('')
const nuevaHora = ref('')
const actionLoading = ref(false)
const actionMsg = ref('')

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const data = await api.get('/api/citas/mis-citas')
    proximas.value = data.proximas || []
    historial.value = data.historial || []
  } catch (e) {}
  try {
    const nots = await api.get('/api/notificaciones')
    notificaciones.value = nots || []
  } catch (e) {}
  loading.value = false
}

function formatFecha(str) {
  const d = new Date(str.replace(' ', 'T'))
  return d.toLocaleDateString('es-VE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

const estadoClasses = {
  pendiente: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-green-100 text-green-800',
  completada: 'bg-blue-100 text-blue-800',
  cancelada_paciente: 'bg-red-100 text-red-700',
  cancelada_doctor: 'bg-red-100 text-red-700',
  no_asistio: 'bg-gray-100 text-gray-600',
  presente: 'bg-emerald-100 text-emerald-800',
}

async function cancelarCita() {
  if (!cancelModal.value) return
  actionLoading.value = true
  try {
    await api.put(`/api/citas/${cancelModal.value.id}/cancelar`, { motivo: cancelMotivo.value || 'Cancelada por el paciente' })
    cancelModal.value = null
    cancelMotivo.value = ''
    await loadData()
    actionMsg.value = 'Cita cancelada correctamente'
    setTimeout(() => actionMsg.value = '', 3000)
  } catch (e) {
    actionMsg.value = e.message
  } finally {
    actionLoading.value = false
  }
}

async function reprogramarCita() {
  if (!reprogramarModal.value || !nuevaFecha.value || !nuevaHora.value) return
  actionLoading.value = true
  try {
    await api.put(`/api/citas/${reprogramarModal.value.id}/reprogramar`, {
      nueva_fecha_hora: `${nuevaFecha.value} ${nuevaHora.value}`,
      motivo: 'Reprogramada por el paciente'
    })
    reprogramarModal.value = null
    nuevaFecha.value = ''
    nuevaHora.value = ''
    await loadData()
    actionMsg.value = 'Cita reprogramada correctamente'
    setTimeout(() => actionMsg.value = '', 3000)
  } catch (e) {
    actionMsg.value = e.data?.mensaje || e.message
  } finally {
    actionLoading.value = false
  }
}

async function marcarTodasLeidas() {
  try {
    await api.put('/api/notificaciones/leer-todas')
    notificaciones.value.forEach(n => n.leida = true)
  } catch (e) {}
}
</script>

<template>
  <div class="min-h-[80vh] bg-gradient-to-b from-medical-50 to-white py-8 px-4">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-medical-900">Mis Citas</h1>
          <p class="text-medical-600 text-sm">Bienvenido/a, {{ auth.user?.nombre }}</p>
        </div>
        <router-link to="/agendar" class="px-5 py-2.5 bg-medical-500 text-white text-sm font-semibold rounded-lg hover:bg-medical-600 transition-colors">+ Nueva Cita</router-link>
      </div>

      <!-- Mensaje de acción -->
      <div v-if="actionMsg" class="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-6 text-sm">{{ actionMsg }}</div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-medical-100 p-1 rounded-xl mb-6">
        <button @click="tab = 'proximas'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', tab === 'proximas' ? 'bg-white text-medical-900 shadow-sm' : 'text-medical-600']">
          Próximas ({{ proximas.length }})
        </button>
        <button @click="tab = 'historial'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', tab === 'historial' ? 'bg-white text-medical-900 shadow-sm' : 'text-medical-600']">
          Historial ({{ historial.length }})
        </button>
        <button @click="tab = 'notificaciones'" :class="['flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', tab === 'notificaciones' ? 'bg-white text-medical-900 shadow-sm' : 'text-medical-600']">
          Avisos ({{ notificaciones.filter(n => !n.leida).length }})
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-medical-500">
        <svg class="animate-spin w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Cargando...
      </div>

      <!-- Proximas -->
      <div v-else-if="tab === 'proximas'">
        <div v-if="!proximas.length" class="text-center py-12 bg-white rounded-2xl border border-medical-100">
          <p class="text-medical-600 mb-4">No tiene citas próximas</p>
          <router-link to="/agendar" class="text-medical-500 font-semibold hover:text-medical-700">Agendar una cita &rarr;</router-link>
        </div>
        <div v-else class="space-y-4">
          <div v-for="c in proximas" :key="c.id" class="bg-white rounded-xl border border-medical-100 p-5 hover:shadow-md transition-shadow">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span :class="['px-2.5 py-1 text-xs font-medium rounded-full', estadoClasses[c.estado] || 'bg-gray-100 text-gray-600']">{{ c.estado }}</span>
                  <span class="text-xs text-medical-400">{{ c.codigo_cita }}</span>
                </div>
                <p class="font-semibold text-medical-900">{{ c.servicio }}</p>
                <p class="text-sm text-medical-600 mt-1">{{ formatFecha(c.fecha_hora) }} a las {{ c.hora }}</p>
                <p class="text-xs text-medical-500 mt-1">{{ c.sede?.nombre }}</p>
              </div>
              <div class="flex gap-2">
                <button v-if="c.puede_reprogramar" @click="reprogramarModal = c" class="px-3 py-2 text-xs font-medium text-medical-600 bg-medical-50 rounded-lg hover:bg-medical-100 transition-colors">Reprogramar</button>
                <button v-if="c.puede_cancelar" @click="cancelModal = c" class="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial -->
      <div v-else-if="tab === 'historial'">
        <div v-if="!historial.length" class="text-center py-12 bg-white rounded-2xl border border-medical-100">
          <p class="text-medical-600">Sin historial de citas</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="c in historial" :key="c.id" class="bg-white rounded-xl border border-gray-100 p-4">
            <div class="flex items-center gap-3 mb-1">
              <span :class="['px-2.5 py-1 text-xs font-medium rounded-full', estadoClasses[c.estado] || 'bg-gray-100 text-gray-600']">{{ c.estado }}</span>
              <span class="text-xs text-gray-400">{{ c.codigo_cita }}</span>
            </div>
            <p class="font-medium text-gray-900 text-sm">{{ c.servicio }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatFecha(c.fecha_hora) }} — {{ c.sede?.nombre }}</p>
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <div v-else-if="tab === 'notificaciones'">
        <div class="flex justify-end mb-4" v-if="notificaciones.some(n => !n.leida)">
          <button @click="marcarTodasLeidas" class="text-xs text-medical-500 hover:text-medical-700">Marcar todas como leídas</button>
        </div>
        <div v-if="!notificaciones.length" class="text-center py-12 bg-white rounded-2xl border border-medical-100">
          <p class="text-medical-600">Sin notificaciones</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="n in notificaciones" :key="n.id" :class="['bg-white rounded-xl border p-4', n.leida ? 'border-gray-100' : 'border-medical-200 bg-medical-50']">
            <p class="font-medium text-sm text-gray-900">{{ n.titulo }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ n.mensaje }}</p>
            <p class="text-xs text-gray-400 mt-2">{{ n.fecha }}</p>
          </div>
        </div>
      </div>

      <!-- Modal Cancelar -->
      <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="cancelModal = null">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h3 class="font-bold text-lg text-gray-900 mb-4">Cancelar Cita</h3>
          <p class="text-sm text-gray-600 mb-4">¿Está seguro de cancelar su cita de {{ cancelModal.servicio }} el {{ formatFecha(cancelModal.fecha_hora) }}?</p>
          <textarea v-model="cancelMotivo" rows="2" placeholder="Motivo de cancelación (opcional)" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-medical-500"></textarea>
          <div class="flex gap-3 justify-end">
            <button @click="cancelModal = null" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">No, mantener</button>
            <button @click="cancelarCita" :disabled="actionLoading" class="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
              {{ actionLoading ? 'Cancelando...' : 'Sí, cancelar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Reprogramar -->
      <div v-if="reprogramarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="reprogramarModal = null">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h3 class="font-bold text-lg text-gray-900 mb-4">Reprogramar Cita</h3>
          <p class="text-sm text-gray-600 mb-4">Seleccione nueva fecha y hora para su cita.</p>
          <div class="space-y-3 mb-4">
            <input type="date" v-model="nuevaFecha" :min="new Date().toISOString().split('T')[0]" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            <input type="time" v-model="nuevaHora" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="reprogramarModal = null" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button @click="reprogramarCita" :disabled="actionLoading || !nuevaFecha || !nuevaHora" class="px-4 py-2 text-sm bg-medical-500 text-white font-medium rounded-lg hover:bg-medical-600 disabled:opacity-50">
              {{ actionLoading ? 'Reprogramando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
