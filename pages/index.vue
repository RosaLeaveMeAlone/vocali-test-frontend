<template>
  <div></div>
</template>

<script setup>
const { token } = useAuth()

onMounted(() => {
  if (token.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>