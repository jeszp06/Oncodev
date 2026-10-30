<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api/client.js'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const tab = ref('citas')
const loading = ref(true)

const citas = ref([])
const estadisticas = ref({})
const sedes = ref([])
const bloqueos = ref([])
const pacientes = ref([])

const filtroEstado = ref('todos')
const filtroSede = ref('')
const filtroFecha = ref('')
const busqueda = ref('')

const estadoModal = ref(null)
const nuevoEstado = ref('')
const notasDoctor = ref('')
const motivoCambio = ref('')

const bloqueoForm = ref({ fecha_inicio: '', hora_inicio: '08:00', fecha_fin: '', hora_fin: '17:00', motivo: '', sede_id: '' })

const actionLoading = ref(false)
const actionMsg = ref('')

onMounted(() => loadAll())

async function loadAll() {
  loading.value = true
  try {
    const [c, e, s, b, p] = await Promise.all([
      api.get('/api/citas').catch(() => []),
      api.get('/api/estadisticas').catch(() => ({})),
      api.get('/api/sedes').catch(() => []),
      api.get('/api/doctor/bloqueos').catch(() => []),
      api.get('/api/pacientes').catch(() => []),
    ])
    citas.value = c
    estadisticas.value = e
    sedes.value = s
    bloqueos.value = b
    pacientes.value = p
  } catch (e) {}
  loading.value = false
}

const citasFiltradas = computed(() => {
  let result = citas.value
  if (filtroEstado.value !== 'todos') result = result.filter(c => c.estado.includes(filtroEstado.value))
  if (filtroSede.value) result = result.filter(c => c.sede_id === parseInt(filtroSede.value))
  if (filtroFecha.value) result = result.filter(c => c.fecha === filtroFecha.value)
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    result = result.filter(c => `${c.paciente} ${c.telefono} ${c.correo} ${c.codigo_cita}`.toLowerCase().includes(q))
  }
  return result
})

const estadoClasses = {
  pendiente: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-green-100 text-green-800',
  completada: 'bg-blue-100 text-blue-800',
  cancelada_paciente: 'bg-red-100 text-red-700',
  cancelada_doctor: 'bg-red-100 text-red-700',
  no_asistio: 'bg-gray-100 text-gray-600',
  presente: 'bg-emerald-100 text-emerald-800',
}

const transicionesPermitidas = ['confirmada', 'presente', 'completada', 'no_asistio', 'cancelada_doctor']

async function cambiarEstado() {
  if (!estadoModal.value || !nuevoEstado.value) return
  actionLoading.value = true
  try {
    await api.put(`/api/citas/${estadoModal.value.id}/estado`, {
      estado: nuevoEstado.value,
      notas_doctor: notasDoctor.value,
      motivo: motivoCambio.value
    })
    estadoModal.value = null
    nuevoEstado.value = ''
    notasDoctor.value = ''
    motivoCambio.value = ''
    showMsg('Estado actualizado')
    await loadAll()
  } catch (e) {
    showMsg(e.message, true)
  } finally {
    actionLoading.value = false
  }
}

async function eliminarCita(id) {
  if (!confirm('¿Eliminar esta cita permanentemente?')) return
  try {
    await api.delete(`/api/citas/${id}`)
    showMsg('Cita eliminada')
    await loadAll()
  } catch (e) {
    showMsg(e.message, true)
  }
}

async function crearBloqueo() {
  const f = bloqueoForm.value
  if (!f.fecha_inicio || !f.fecha_fin) return
  actionLoading.value = true
  try {
    await api.post('/api/doctor/bloqueos', {
      fecha_inicio: `${f.fecha_inicio} ${f.hora_inicio}`,
      fecha_fin: `${f.fecha_fin} ${f.hora_fin}`,
      motivo: f.motivo,
      sede_id: f.sede_id ? parseInt(f.sede_id) : null
    })
    bloqueoForm.value = { fecha_inicio: '', hora_inicio: '08:00', fecha_fin: '', hora_fin: '17:00', motivo: '', sede_id: '' }
    showMsg('Bloqueo creado')
    await loadAll()
  } catch (e) {
    showMsg(e.message, true)
  } finally {
    actionLoading.value = false
  }
}

async function eliminarBloqueo(id) {
  try {
    await api.delete(`/api/doctor/bloqueos/${id}`)
    showMsg('Bloqueo eliminado')
    await loadAll()
  } catch (e) {
    showMsg(e.message, true)
  }
}

function showMsg(msg, isError = false) {
  actionMsg.value = { text: msg, error: isError }
  setTimeout(() => actionMsg.value = '', 4000)
}

function formatFecha(str) {
  const d = new Date(str.replace(' ', 'T'))
  return d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="min-h-[80vh] bg-gray-50 py-6 px-4">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 class="text-2xl font-bold text-medical-900">Panel Médico</h1>
          <p class="text-medical-600 text-sm">Dr. {{ auth.user?.nombre }}</p>
        </div>
      </div>

      <!-- Mensaje -->
      <div v-if="actionMsg" :class="['rounded-xl px-4 py-3 mb-4 text-sm', actionMsg.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200']">{{ actionMsg.text }}</div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-medical-900">{{ estadisticas.total_citas || 0 }}</p>
          <p class="text-xs text-gray-500">Total Citas</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-amber-600">{{ estadisticas.citas_pendientes || 0 }}</p>
          <p class="text-xs text-gray-500">Pendientes</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ estadisticas.citas_confirmadas || 0 }}</p>
          <p class="text-xs text-gray-500">Confirmadas</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p class="text-2xl font-bold text-medical-600">{{ estadisticas.total_pacientes || 0 }}</p>
          <p class="text-xs text-gray-500">Pacientes</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6 overflow-x-auto">
        <button @click="tab = 'citas'" :class="['flex-1 min-w-fit py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap', tab === 'citas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600']">Agenda</button>
        <button @click="tab = 'bloqueos'" :class="['flex-1 min-w-fit py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap', tab === 'bloqueos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600']">Horarios / Bloqueos</button>
        <button @click="tab = 'pacientes'" :class="['flex-1 min-w-fit py-2.5 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap', tab === 'pacientes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600']">Pacientes</button>
      </div>

      <div v-if="loading" class="text-center py-12 text-medical-500">Cargando...</div>

      <!-- TAB: CITAS -->
      <div v-else-if="tab === 'citas'">
        <!-- Filtros -->
        <div class="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input v-model="busqueda" placeholder="Buscar paciente..." class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            <select v-model="filtroEstado" class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500">
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="presente">Presente</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
            <select v-model="filtroSede" class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500">
              <option value="">Todas las sedes</option>
              <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
            </select>
            <input type="date" v-model="filtroFecha" class="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
          </div>
        </div>

        <div v-if="!citasFiltradas.length" class="text-center py-8 bg-white rounded-xl border border-gray-100">
          <p class="text-gray-500">No se encontraron citas</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="c in citasFiltradas" :key="c.id" class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span :class="['px-2 py-0.5 text-xs font-medium rounded-full', estadoClasses[c.estado] || 'bg-gray-100 text-gray-600']">{{ c.estado }}</span>
                  <span class="text-xs text-gray-400">{{ c.codigo_cita }}</span>
                  <span class="text-xs text-gray-400">{{ c.fecha }} {{ c.hora }}</span>
                </div>
                <p class="font-semibold text-gray-900 text-sm">{{ c.paciente }}</p>
                <p class="text-xs text-gray-500">{{ c.servicio }} · {{ c.sede }}</p>
                <p v-if="c.telefono" class="text-xs text-gray-400 mt-0.5">Tel: {{ c.telefono }}</p>
                <p v-if="c.sintomas" class="text-xs text-medical-600 mt-1 italic">"{{ c.sintomas }}"</p>
              </div>
              <div class="flex gap-2 flex-wrap">
                <button @click="estadoModal = c" class="px-3 py-1.5 text-xs font-medium bg-medical-50 text-medical-700 rounded-lg hover:bg-medical-100 transition-colors">Cambiar Estado</button>
                <button @click="eliminarCita(c.id)" class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: BLOQUEOS -->
      <div v-else-if="tab === 'bloqueos'">
        <div class="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 class="font-bold text-gray-900 mb-4">Bloquear Días / Horarios</h3>
          <p class="text-sm text-gray-500 mb-4">Marque los días que no estará disponible (vacaciones, cirugías, compromisos).</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
              <input type="date" v-model="bloqueoForm.fecha_inicio" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Hora inicio</label>
              <input type="time" v-model="bloqueoForm.hora_inicio" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
              <input type="date" v-model="bloqueoForm.fecha_fin" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Hora fin</label>
              <input type="time" v-model="bloqueoForm.hora_fin" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Sede (opcional)</label>
              <select v-model="bloqueoForm.sede_id" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500">
                <option value="">Todas las sedes</option>
                <option v-for="s in sedes" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
              <input v-model="bloqueoForm.motivo" placeholder="Ej: Vacaciones, Cirugía..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" />
            </div>
          </div>
          <button @click="crearBloqueo" :disabled="actionLoading" class="mt-4 px-5 py-2.5 bg-medical-800 text-white text-sm font-semibold rounded-lg hover:bg-medical-900 disabled:opacity-50 transition-colors">
            {{ actionLoading ? 'Creando...' : 'Crear Bloqueo' }}
          </button>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h3 class="font-bold text-gray-900 mb-4">Bloqueos Activos</h3>
          <div v-if="!bloqueos.length" class="text-center text-gray-400 text-sm py-6">Sin bloqueos registrados</div>
          <div v-else class="space-y-3">
            <div v-for="b in bloqueos" :key="b.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ b.motivo }}</p>
                <p class="text-xs text-gray-500">{{ b.fecha_inicio }} → {{ b.fecha_fin }}</p>
              </div>
              <button @click="eliminarBloqueo(b.id)" class="text-xs text-red-500 hover:text-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: PACIENTES -->
      <div v-else-if="tab === 'pacientes'">
        <div v-if="!pacientes.length" class="text-center py-8 bg-white rounded-xl border border-gray-100">
          <p class="text-gray-500">Sin pacientes registrados</p>
        </div>
        <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contacto</th>
                  <th class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Citas</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Última Cita</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="p in pacientes" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <img v-if="p.foto_url" :src="p.foto_url" class="w-8 h-8 rounded-full" referrerpolicy="no-referrer" />
                      <div v-else class="w-8 h-8 rounded-full bg-medical-100 flex items-center justify-center text-xs font-bold text-medical-600">{{ p.nombre?.charAt(0) }}</div>
                      <div>
                        <p class="font-medium text-gray-900">{{ p.nombre }}</p>
                        <p class="text-xs text-gray-400">{{ p.tipo === 'google' ? 'Google' : 'Manual' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-600">
                    <p>{{ p.correo }}</p>
                    <p>{{ p.telefono }}</p>
                  </td>
                  <td class="px-4 py-3 text-center font-medium">{{ p.total_citas }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ p.ultima_cita || 'N/A' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Cambiar Estado -->
      <div v-if="estadoModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="estadoModal = null">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h3 class="font-bold text-lg text-gray-900 mb-2">Cambiar Estado de Cita</h3>
          <p class="text-sm text-gray-500 mb-4">{{ estadoModal.paciente }} — {{ estadoModal.fecha }} {{ estadoModal.hora }}</p>
          <p class="text-xs text-gray-400 mb-3">Estado actual: <span class="font-medium">{{ estadoModal.estado }}</span></p>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Nuevo Estado</label>
              <select v-model="nuevoEstado" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500">
                <option value="">Seleccionar...</option>
                <option v-for="e in transicionesPermitidas" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Notas del Doctor</label>
              <textarea v-model="notasDoctor" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-medical-500" placeholder="Observaciones clínicas..."></textarea>
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-5">
            <button @click="estadoModal = null" class="px-4 py-2 text-sm text-gray-600">Cancelar</button>
            <button @click="cambiarEstado" :disabled="!nuevoEstado || actionLoading" class="px-4 py-2 text-sm bg-medical-500 text-white font-medium rounded-lg hover:bg-medical-600 disabled:opacity-50">
              {{ actionLoading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
