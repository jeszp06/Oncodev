<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api/client.js'

const servicios = ref([])
const sedes = ref([])

onMounted(async () => {
  try { servicios.value = await api.get('/api/servicios') } catch (e) { /* fallback below */ }
  try { sedes.value = await api.get('/api/sedes') } catch (e) { /* fallback below */ }
})
</script>

<template>
  <!-- HERO -->
  <section class="relative bg-gradient-to-br from-medical-50 via-white to-medical-100 py-24 md:py-36 px-6 overflow-hidden">
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-72 h-72 bg-medical-400 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-medical-300 rounded-full blur-3xl"></div>
    </div>
    <div class="relative max-w-3xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-extrabold text-medical-900 mb-6 leading-tight tracking-tight">
        Atención Urológica<br class="hidden sm:block" />
        <span class="text-medical-500">Humana y de Vanguardia</span>
      </h1>
      <p class="text-lg text-medical-600 mb-10 max-w-xl mx-auto leading-relaxed">
        Dr. Lisandro Márquez — Urólogo y Oncólogo. Acompañamiento integral, tratamientos personalizados y empatía en cada paso de su proceso.
      </p>
      <a href="#servicios" class="inline-flex items-center gap-2 text-medical-500 font-semibold hover:text-medical-700 transition-colors text-sm">
        Conocer más
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </a>
    </div>
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="py-20 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-medical-900 mb-3">Servicios Especializados</h2>
        <p class="text-sm text-medical-500 max-w-lg mx-auto">Atención integral con tecnología de vanguardia y trato humano.</p>
      </div>

      <div v-if="servicios.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="s in servicios" :key="s.id" class="group p-6 bg-medical-50 rounded-xl border border-medical-100 hover:border-medical-300 hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-medical-200 transition-colors">
            <svg class="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="font-bold text-medical-900 mb-2">{{ s.nombre }}</h3>
          <p class="text-sm text-medical-600 leading-relaxed">{{ s.descripcion }}</p>
          <p v-if="s.duracion_minutos" class="text-xs text-medical-400 mt-3">Duración aprox: {{ s.duracion_minutos }} min</p>
        </div>
      </div>

      <!-- Fallback cuando no hay API -->
      <div v-else class="grid md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="p-6 bg-medical-50 rounded-xl border border-medical-100 animate-pulse">
          <div class="w-12 h-12 bg-medical-200 rounded-lg mb-4"></div>
          <div class="h-5 bg-medical-200 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-medical-100 rounded w-full mb-2"></div>
          <div class="h-3 bg-medical-100 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- SOBRE EL DOCTOR -->
  <section class="py-20 px-6 bg-medical-50/50">
    <div class="max-w-3xl mx-auto text-center">
      <div class="w-24 h-24 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-12 h-12 text-medical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-medical-900 mb-1">Dr. Lisandro Márquez</h2>
      <p class="text-sm text-medical-500 font-medium mb-5">Especialista en Urología y Oncología Médica</p>
      <p class="text-sm text-medical-600 leading-relaxed max-w-xl mx-auto">
        Médico cirujano con amplia experiencia en urología diagnóstica, quirúrgica y oncológica. Comprometido con la atención personalizada y un enfoque centrado en el bienestar integral del paciente.
      </p>
      <div class="flex flex-wrap gap-2 justify-center mt-6">
        <span class="px-3 py-1 bg-white text-medical-600 text-xs rounded-full border border-medical-200">Urología</span>
        <span class="px-3 py-1 bg-white text-medical-600 text-xs rounded-full border border-medical-200">Oncología</span>
        <span class="px-3 py-1 bg-white text-medical-600 text-xs rounded-full border border-medical-200">Cirugía Ambulatoria</span>
        <span class="px-3 py-1 bg-white text-medical-600 text-xs rounded-full border border-medical-200">Ecografía Urológica</span>
      </div>
    </div>
  </section>

  <!-- SEDES -->
  <section id="sedes" class="py-20 px-6 bg-white">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-bold text-medical-900 mb-3">Nuestras Sedes</h2>
        <p class="text-sm text-medical-500 max-w-lg mx-auto">Consultorios ubicados para su comodidad.</p>
      </div>

      <div v-if="sedes.length" class="grid md:grid-cols-3 gap-6">
        <div v-for="s in sedes" :key="s.id" class="p-6 bg-medical-50 rounded-xl border border-medical-100 hover:shadow-lg transition-all">
          <div class="w-10 h-10 bg-medical-500 text-white rounded-lg flex items-center justify-center mb-4 font-bold text-sm">
            {{ s.ciudad?.charAt(0) }}
          </div>
          <h3 class="font-bold text-medical-900 mb-1">{{ s.nombre }}</h3>
          <p class="text-sm text-medical-600 mb-2">{{ s.clinica }}</p>
          <p v-if="s.direccion" class="text-xs text-medical-500 mb-3">{{ s.direccion }}</p>
          <p v-if="s.horarios_texto" class="text-xs text-medical-400">
            <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ s.horarios_texto }}
          </p>
          <router-link :to="{ path: '/agendar', query: { sede: s.id } }" class="inline-block mt-4 text-xs text-medical-500 font-medium hover:text-medical-700 transition-colors">
            Ver disponibilidad &rarr;
          </router-link>
        </div>
      </div>

      <div v-else class="grid md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="p-6 bg-medical-50 rounded-xl border border-medical-100 animate-pulse">
          <div class="w-10 h-10 bg-medical-200 rounded-lg mb-4"></div>
          <div class="h-5 bg-medical-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-medical-100 rounded w-full mb-2"></div>
          <div class="h-3 bg-medical-100 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </section>

</template>
