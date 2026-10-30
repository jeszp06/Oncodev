<script setup>
import Navbar from './components/Navbar.vue'
import WhatsAppButton from './components/WhatsAppButton.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans antialiased">
    <Navbar />
    <main>
      <router-view />
    </main>

    <footer class="bg-medical-900 text-medical-50 py-10 text-center text-sm">
      <p class="font-medium">&copy; {{ new Date().getFullYear() }} Dr. Lisandro Márquez</p>
      <p class="mt-1 text-medical-300">Especialista en Urología y Oncología Médica</p>
      <p class="mt-1 text-medical-400">Caracas · Guatire · Barlovento — Venezuela</p>
    </footer>

    <WhatsAppButton />
  </div>
</template>
