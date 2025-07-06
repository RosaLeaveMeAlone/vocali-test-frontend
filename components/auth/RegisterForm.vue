<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="form-title">Crear Cuenta</h2>
      <p class="form-subtitle">Completa los datos para comenzar</p>
    </div>

    <div v-if="error" class="error-message">
      <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <form @submit.prevent="handleRegister" class="register-form-content">
      <div class="form-group">
        <label for="email" class="form-label">
          <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          Email
        </label>
        <input
          v-model="form.email"
          type="email"
          id="email"
          class="form-input"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div class="form-group">
        <label for="password" class="form-label">
          <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Contraseña
        </label>
        <input
          v-model="form.password"
          type="password"
          id="password"
          class="form-input"
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">
          <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Confirmar Contraseña
        </label>
        <input
          v-model="form.confirmPassword"
          type="password"
          id="confirmPassword"
          class="form-input"
          placeholder="Repite tu contraseña"
          required
        />
      </div>

      <button
        type="submit"
        class="submit-button"
        :disabled="isLoading"
      >
        <svg v-if="isLoading" class="loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="!isLoading">Crear Cuenta</span>
        <span v-else>Creando cuenta...</span>
      </button>
    </form>

    <div class="form-footer">
      <p class="footer-text">
        ¿Ya tienes una cuenta? 
        <NuxtLink to="/login" class="footer-link">
          Inicia sesión aquí
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const { register } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const error = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    await register(form.value.email, form.value.password, form.value.confirmPassword)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Error al crear la cuenta'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
  max-width: 420px;
  margin: 0 auto;
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.register-form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.label-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  background-color: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.submit-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.footer-link {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.footer-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .register-form {
    padding: 1.5rem;
    max-width: 100%;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>