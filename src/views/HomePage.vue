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
  <section class="relative bg-gradient-to-br from-medical-50 via-white to-medical-100 py-20 md:py-32 px-6 overflow-hidden">
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-10 left-10 w-72 h-72 bg-medical-400 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-medical-300 rounded-full blur-3xl"></div>
    </div>
    <div class="relative max-w-4xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 bg-medical-100 text-medical-700 text-sm font-medium rounded-full mb-6">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        Atención Médica de Confianza
      </div>
      <h1 class="text-4xl md:text-6xl font-extrabold text-medical-900 mb-6 leading-tight tracking-tight">
        Atención Urológica<br class="hidden sm:block" />
        <span class="text-medical-500">Humana y de Vanguardia</span>
      </h1>
      <p class="text-lg md:text-xl text-medical-700 mb-10 max-w-2xl mx-auto leading-relaxed">
        Dr. Lisandro Márquez — Urólogo y Oncólogo. Acompañamiento integral, tratamientos personalizados y empatía en cada paso de su proceso.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link to="/agendar" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-medical-500 text-white font-bold rounded-xl shadow-lg shadow-medical-500/25 hover:bg-medical-600 transition-all hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-medical-500/50 outline-none">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Agendar Consulta
        </router-link>
        <a href="#servicios" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-medical-700 font-semibold rounded-xl border border-medical-200 hover:border-medical-400 hover:bg-medical-50 transition-all">
          Ver Servicios
        </a>
      </div>
    </div>
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="py-20 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-bold text-medical-900 mb-4">Servicios Especializados</h2>
        <p class="text-medical-600 max-w-2xl mx-auto">Ofrecemos atención integral con tecnología de vanguardia y un trato humano que hace la diferencia.</p>
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
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="p-6 bg-medical-50 rounded-xl border border-medical-100 animate-pulse">
          <div class="w-12 h-12 bg-medical-200 rounded-lg mb-4"></div>
          <div class="h-5 bg-medical-200 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-medical-100 rounded w-full mb-2"></div>
          <div class="h-3 bg-medical-100 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- SOBRE EL DOCTOR -->
  <section class="py-20 px-6 bg-gradient-to-b from-medical-50 to-white">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-sm border border-medical-100 p-8 md:p-12">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="w-32 h-32 md:w-40 md:h-40 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-16 h-16 text-medical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-medical-900 mb-2">Dr. Lisandro Márquez</h2>
            <p class="text-medical-500 font-semibold mb-4">Especialista en Urología y Oncología Médica</p>
            <div class="space-y-2 text-medical-700 text-sm leading-relaxed">
              <p>Médico cirujano con amplia experiencia en urología diagnóstica, quirúrgica y oncológica. Comprometido con la atención personalizada y el uso de tecnología de última generación.</p>
              <p>Atención en múltiples sedes para mayor comodidad de sus pacientes, con un enfoque centrado en el bienestar integral del paciente.</p>
            </div>
            <div class="flex flex-wrap gap-3 mt-6">
              <span class="px-3 py-1 bg-medical-100 text-medical-700 text-xs font-medium rounded-full">Urología</span>
              <span class="px-3 py-1 bg-medical-100 text-medical-700 text-xs font-medium rounded-full">Oncología</span>
              <span class="px-3 py-1 bg-medical-100 text-medical-700 text-xs font-medium rounded-full">Cirugía Ambulatoria</span>
              <span class="px-3 py-1 bg-medical-100 text-medical-700 text-xs font-medium rounded-full">Ecografía Urológica</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SEDES -->
  <section id="sedes" class="py-20 px-6 bg-white">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-bold text-medical-900 mb-4">Nuestras Sedes</h2>
        <p class="text-medical-600 max-w-2xl mx-auto">Consultorios ubicados estratégicamente para su comodidad.</p>
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
          <router-link :to="{ path: '/agendar', query: { sede: s.id } }" class="inline-block mt-4 text-sm text-medical-500 font-semibold hover:text-medical-700 transition-colors">
            Agendar aquí &rarr;
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

  <!-- CTA FINAL -->
  <section class="py-16 px-6 bg-medical-900">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">¿Listo para agendar su consulta?</h2>
      <p class="text-medical-300 mb-8">Seleccione el día y hora que mejor se adapte a su disponibilidad. Recibirá confirmación inmediata.</p>
      <router-link to="/agendar" class="inline-flex items-center gap-2 px-8 py-4 bg-white text-medical-900 font-bold rounded-xl hover:bg-medical-50 transition-all shadow-lg">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        Agendar Ahora
      </router-link>
    </div>
  </section>
</template>
