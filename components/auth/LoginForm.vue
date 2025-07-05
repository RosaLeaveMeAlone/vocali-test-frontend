<template>
  <div class="login-form">
    <!-- Header del formulario -->
    <div class="form-header">
      <h2 class="form-title">Iniciar Sesión</h2>
      <p class="form-subtitle">Accede a tu cuenta</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleLogin" class="login-form-content">
      <!-- Campo Email -->
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

      <!-- Campo Contraseña -->
      <div class="form-group">
        <label for="password" class="form-label">
          <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Contraseña
        </label>
        <div class="password-field">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            class="form-input"
            placeholder="Tu contraseña"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            <svg v-if="showPassword" class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <svg v-else class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Botón de envío -->
      <button
        type="submit"
        class="submit-button"
        :disabled="isLoading"
      >
        <svg v-if="isLoading" class="loading-spinner" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-if="!isLoading">Iniciar Sesión</span>
        <span v-else>Iniciando sesión...</span>
      </button>
    </form>

    <!-- Opciones adicionales -->
    <div class="form-options">
      <button class="forgot-password-link">
        ¿Olvidaste tu contraseña?
      </button>
    </div>

    <!-- Link a registro -->
    <div class="form-footer">
      <p class="footer-text">
        ¿No tienes una cuenta? 
        <NuxtLink to="/register" class="footer-link">
          Regístrate aquí
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const { login } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

const error = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    await login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
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

.login-form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.password-field {
  position: relative;
  display: flex;
  align-items: center;
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

.password-field .form-input {
  padding-right: 3rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease-in-out;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: #374151;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
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

.form-options {
  margin-top: 1.5rem;
  text-align: center;
}

.forgot-password-link {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease-in-out;
}

.forgot-password-link:hover {
  color: #3b82f6;
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
  .login-form {
    padding: 1.5rem;
    max-width: 100%;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
}
</style>