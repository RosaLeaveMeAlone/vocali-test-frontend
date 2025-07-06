<template>
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <v-progress-circular indeterminate size="64"></v-progress-circular>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
})

</script>