<template>
  <div class="min-h-screen bg-gray-100">
    <DashboardHeader @logout="handleLogout" />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <slot />
        
        <LoadingModal :is-loading="isLoading" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { logout } = useAuth()

import DashboardHeader from '~/components/DashboardHeader.vue'
import LoadingModal from '~/components/ui/LoadingModal.vue'

const isLoading = ref(false)

const handleLogout = async () => {
  console.log('Logging out...')
  await logout()
}

defineExpose({
  isLoading
})
</script>