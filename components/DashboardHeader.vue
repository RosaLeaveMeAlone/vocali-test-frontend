<template>
  <header class="header-container">
    <div class="header-content">
      <div class="header-flex">
        <h1 class="header-title">Dashboard de Transcripciones</h1>
        
        <!-- Navegación -->
        <nav class="nav-container">
          <NuxtLink to="/dashboard" class="nav-link">
            Transcripciones
          </NuxtLink>
          <NuxtLink to="/dashboard/real-time" class="nav-link">
            Real Time
          </NuxtLink>
        </nav>
        
        <button 
          @click="$emit('logout')"
          class="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
// Definir los eventos que emite el componente
defineEmits(['logout'])
</script>

<style scoped>
.header-container {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .header-content {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .header-content {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

/* Estilos de navegación */
.nav-container {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  color: #374151;
  background-color: #f3f4f6;
}

/* Estilo para el enlace activo */
.nav-link.router-link-active {
  color: #2563eb;
  background-color: #eff6ff;
  font-weight: 600;
}

.nav-link.router-link-exact-active {
  color: #2563eb;
  background-color: #eff6ff;
  font-weight: 600;
}

.logout-button {
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.logout-button:hover {
  background-color: #b91c1c;
}

.logout-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #dc2626;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .header-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .nav-container {
    justify-content: center;
    order: 2;
  }
  
  .logout-button {
    order: 3;
    align-self: center;
  }
  
  .header-title {
    order: 1;
    text-align: center;
  }
}
</style>