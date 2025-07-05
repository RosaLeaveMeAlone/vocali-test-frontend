<template>
  <div>
    <RegisterForm />
  </div>
</template>

<script setup>
import RegisterForm from '~/components/auth/RegisterForm.vue';

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
});
</script>