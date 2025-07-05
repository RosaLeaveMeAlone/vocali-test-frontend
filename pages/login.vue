<template>
  <div>
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '~/components/auth/LoginForm.vue';

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
});
</script>