<script setup>
import { navigateTo } from '#app';

const handleRedirect = () => {
  navigateTo('/login'); // Middleware will handle redirection to /dashboard if authenticated
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center text-white">
      <h1 class="text-9xl font-bold">Error 404</h1> 
      <button
        @click="handleRedirect"
        class="mt-6 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Go to the app
      </button>
    </div>
  </div>
</template>
