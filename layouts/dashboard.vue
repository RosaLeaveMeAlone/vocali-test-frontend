<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <DashboardHeader @logout="handleLogout" />

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Aquí se renderiza el contenido de cada página -->
        <slot />
        
        <!-- Modal de carga global -->
        <LoadingModal :is-loading="isLoading" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Composables
const { logout } = useAuth()

// Componentes
import DashboardHeader from '~/components/DashboardHeader.vue'
import LoadingModal from '~/components/ui/LoadingModal.vue'

// Estado global del loading (opcional)
const isLoading = ref(false)

// Función para manejar logout
const handleLogout = async () => {
  console.log('Logging out...')
  await logout()
}

// Exportar el estado de loading para que las páginas puedan usarlo
defineExpose({
  isLoading
})
</script>