<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { api } from '../api/client.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const step = ref(1)
const totalSteps = 4

const servicios = ref([])
const sedes = ref([])
const slots = ref([])
const loadingSlots = ref(false)

const selectedServicio = ref(null)
const selectedSede = ref(null)
const selectedFecha = ref('')
const selectedHora = ref('')
const sintomas = ref('')
const submitting = ref(false)
const bookingResult = ref(null)
const errorMsg = ref('')

const today = computed(() => {
  const d = new Date()
  return d.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 60)
  return d.toISOString().split('T')[0]
})

onMounted(async () => {
  try { servicios.value = await api.get('/api/servicios') } catch (e) {}
  try { sedes.value = await api.get('/api/sedes') } catch (e) {}

  if (route.query.sede) {
    const sedeId = parseInt(route.query.sede)
    const sede = sedes.value.find(s => s.id === sedeId)
    if (sede) {
      selectedSede.value = sede
    }
  }
})

watch([selectedFecha, selectedSede, selectedServicio], async () => {
  if (!selectedFecha.value || !selectedSede.value) return
  loadingSlots.value = true
  slots.value = []
  selectedHora.value = ''
  try {
    const params = new URLSearchParams({
      fecha: selectedFecha.value,
      sede_id: selectedSede.value.id,
    })
    if (selectedServicio.value) params.set('servicio_id', selectedServicio.value.id)
    const data = await api.get(`/api/disponibilidad?${params}`)
    slots.value = data.slots || []
    if (!data.disponible && data.motivo) {
      errorMsg.value = data.motivo
    } else {
      errorMsg.value = ''
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loadingSlots.value = false
  }
})

const availableSlots = computed(() => slots.value.filter(s => s.disponible))

function nextStep() {
  if (step.value < totalSteps) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

const canProceed = computed(() => {
  if (step.value === 1) return !!selectedServicio.value
  if (step.value === 2) return !!selectedSede.value
  if (step.value === 3) return !!selectedFecha.value && !!selectedHora.value
  return true
})

function formatFecha(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

async function confirmarCita() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/agendar' } })
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    const data = await api.post('/api/citas', {
      fecha_hora: `${selectedFecha.value} ${selectedHora.value}`,
      servicio_id: selectedServicio.value.id,
      sede_id: selectedSede.value.id,
      sintomas: sintomas.value,
    })
    bookingResult.value = data
  } catch (e) {
    errorMsg.value = e.data?.mensaje || e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] bg-gradient-to-b from-medical-50 to-white py-10 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Resultado exitoso -->
      <div v-if="bookingResult" class="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Cita Agendada!</h2>
        <p class="text-gray-600 mb-6">Su cita ha sido registrada exitosamente.</p>
        <div class="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto space-y-2 text-sm">
          <p><span class="font-medium text-gray-700">Código:</span> {{ bookingResult.codigo_cita }}</p>
          <p><span class="font-medium text-gray-700">Fecha:</span> {{ formatFecha(selectedFecha) }}</p>
          <p><span class="font-medium text-gray-700">Hora:</span> {{ selectedHora }}</p>
          <p><span class="font-medium text-gray-700">Servicio:</span> {{ bookingResult.servicio }}</p>
          <p><span class="font-medium text-gray-700">Sede:</span> {{ selectedSede?.nombre }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <router-link to="/mis-citas" class="px-6 py-3 bg-medical-500 text-white font-semibold rounded-lg hover:bg-medical-600 transition-colors">Ver Mis Citas</router-link>
          <router-link to="/" class="px-6 py-3 bg-white text-medical-700 font-semibold rounded-lg border border-medical-200 hover:bg-medical-50 transition-colors">Volver al Inicio</router-link>
        </div>
      </div>

      <!-- Wizard -->
      <template v-else>
        <h1 class="text-2xl md:text-3xl font-bold text-medical-900 text-center mb-2">Agendar Consulta</h1>
        <p class="text-medical-600 text-center mb-8">Siga los pasos para reservar su cita médica</p>

        <!-- Progress bar -->
        <div class="flex items-center justify-center gap-2 mb-10">
          <template v-for="s in totalSteps" :key="s">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              s <= step ? 'bg-medical-500 text-white shadow-md' : 'bg-medical-100 text-medical-400'
            ]">{{ s }}</div>
            <div v-if="s < totalSteps" :class="['w-8 md:w-16 h-1 rounded-full transition-all', s < step ? 'bg-medical-500' : 'bg-medical-200']"></div>
          </template>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-medical-100 p-6 md:p-8">

          <!-- STEP 1: Servicio -->
          <div v-if="step === 1">
            <h3 class="text-lg font-bold text-medical-900 mb-1">Seleccione el Servicio</h3>
            <p class="text-sm text-medical-500 mb-6">¿Qué tipo de consulta necesita?</p>
            <div class="space-y-3">
              <button
                v-for="s in servicios" :key="s.id"
                @click="selectedServicio = s"
                :class="[
                  'w-full text-left p-4 rounded-xl border-2 transition-all',
                  selectedServicio?.id === s.id
                    ? 'border-medical-500 bg-medical-50 shadow-sm'
                    : 'border-gray-100 hover:border-medical-200 hover:bg-gray-50'
                ]"
              >
                <div class="font-semibold text-gray-900 text-sm">{{ s.nombre }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ s.descripcion }}</div>
                <div v-if="s.duracion_minutos" class="text-xs text-medical-500 mt-1">⏱ {{ s.duracion_minutos }} min</div>
              </button>
            </div>
          </div>

          <!-- STEP 2: Sede -->
          <div v-if="step === 2">
            <h3 class="text-lg font-bold text-medical-900 mb-1">Seleccione la Sede</h3>
            <p class="text-sm text-medical-500 mb-6">¿Dónde desea atenderse?</p>
            <div class="space-y-3">
              <button
                v-for="s in sedes" :key="s.id"
                @click="selectedSede = s"
                :class="[
                  'w-full text-left p-4 rounded-xl border-2 transition-all',
                  selectedSede?.id === s.id
                    ? 'border-medical-500 bg-medical-50 shadow-sm'
                    : 'border-gray-100 hover:border-medical-200 hover:bg-gray-50'
                ]"
              >
                <div class="font-semibold text-gray-900 text-sm">{{ s.nombre }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ s.direccion }}</div>
                <div v-if="s.horarios_texto" class="text-xs text-medical-400 mt-1">{{ s.horarios_texto }}</div>
              </button>
            </div>
          </div>

          <!-- STEP 3: Fecha y Hora -->
          <div v-if="step === 3">
            <h3 class="text-lg font-bold text-medical-900 mb-1">Seleccione Fecha y Hora</h3>
            <p class="text-sm text-medical-500 mb-6">Horarios disponibles en {{ selectedSede?.nombre }}</p>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                v-model="selectedFecha"
                :min="today"
                :max="maxDate"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none transition-all"
              />
            </div>

            <div v-if="loadingSlots" class="flex items-center justify-center py-8 text-medical-500">
              <svg class="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Consultando disponibilidad...
            </div>

            <div v-else-if="selectedFecha && slots.length">
              <label class="block text-sm font-medium text-gray-700 mb-3">Horarios Disponibles</label>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button
                  v-for="s in slots" :key="s.hora"
                  @click="s.disponible && (selectedHora = s.hora)"
                  :disabled="!s.disponible"
                  :class="[
                    'py-3 px-2 rounded-lg text-sm font-medium transition-all',
                    selectedHora === s.hora
                      ? 'bg-medical-500 text-white shadow-md'
                      : s.disponible
                        ? 'bg-gray-50 text-gray-700 hover:bg-medical-50 hover:text-medical-700 border border-gray-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                  ]"
                >
                  {{ s.hora }}
                </button>
              </div>
              <p v-if="!availableSlots.length" class="text-sm text-amber-600 mt-4 text-center">No hay horarios disponibles para esta fecha. Intente con otro día.</p>
            </div>

            <div v-else-if="selectedFecha && errorMsg" class="text-center py-8">
              <p class="text-amber-600 text-sm">{{ errorMsg }}</p>
            </div>
          </div>

          <!-- STEP 4: Confirmación -->
          <div v-if="step === 4">
            <h3 class="text-lg font-bold text-medical-900 mb-1">Confirme su Cita</h3>
            <p class="text-sm text-medical-500 mb-6">Revise los datos antes de confirmar</p>

            <div v-if="!auth.isLoggedIn" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p class="text-sm text-amber-800 font-medium">Debe iniciar sesión para confirmar la cita</p>
              <router-link :to="{ name: 'login', query: { redirect: '/agendar' } }" class="inline-block mt-2 text-sm text-medical-600 font-semibold hover:text-medical-800">Iniciar Sesión con Google &rarr;</router-link>
            </div>

            <div class="bg-medical-50 rounded-xl p-5 space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-medical-600">Servicio:</span><span class="font-medium text-medical-900">{{ selectedServicio?.nombre }}</span></div>
              <div class="flex justify-between"><span class="text-medical-600">Sede:</span><span class="font-medium text-medical-900">{{ selectedSede?.nombre }}</span></div>
              <div class="flex justify-between"><span class="text-medical-600">Fecha:</span><span class="font-medium text-medical-900">{{ formatFecha(selectedFecha) }}</span></div>
              <div class="flex justify-between"><span class="text-medical-600">Hora:</span><span class="font-medium text-medical-900">{{ selectedHora }}</span></div>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Síntomas o motivo de consulta (opcional)</label>
              <textarea v-model="sintomas" rows="3" placeholder="Describa brevemente el motivo de su consulta..." class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none resize-none"></textarea>
            </div>

            <p v-if="errorMsg" class="text-red-600 text-sm mt-4 text-center">{{ errorMsg }}</p>
          </div>

          <!-- Nav buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button v-if="step > 1" @click="prevStep" class="px-6 py-3 text-medical-600 font-medium hover:text-medical-800 transition-colors">&larr; Anterior</button>
            <div v-else></div>

            <button
              v-if="step < totalSteps"
              @click="nextStep"
              :disabled="!canProceed"
              :class="[
                'px-6 py-3 font-semibold rounded-lg transition-all',
                canProceed
                  ? 'bg-medical-500 text-white hover:bg-medical-600 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]"
            >Siguiente &rarr;</button>

            <button
              v-else
              @click="confirmarCita"
              :disabled="submitting || !auth.isLoggedIn"
              :class="[
                'px-8 py-3 font-bold rounded-lg transition-all',
                submitting || !auth.isLoggedIn
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
              ]"
            >
              <span v-if="submitting">Agendando...</span>
              <span v-else>Confirmar Cita</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
