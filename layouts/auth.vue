<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Mi App</h1>
        <p class="text-gray-600">Bienvenido de vuelta</p>
      </div>
      
      <div class="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <slot />
      </div>
      
      <div class="text-center mt-6 text-sm text-gray-500">
        <p>Technical test.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Remove this logic - let middleware handle redirections
// The middleware should handle auth logic, not the layout
</script>

<style scoped>
/* Animaciones sutiles */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>