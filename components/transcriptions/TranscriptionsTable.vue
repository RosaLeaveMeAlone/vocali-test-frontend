<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Transcripciones</h1>
        
        <v-card>
          <v-data-table
            :headers="headers"
            :items="transcriptions"
            :loading="loading"
            :items-per-page="-1"
            hide-default-footer
            class="elevation-1"
          >
            <!-- Columna de contenido personalizada -->
            <template v-slot:item.content="{ item }">
              <div style="max-width: 300px;">
                <v-tooltip :text="item.content">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props" class="text-truncate d-block">
                      {{ item.content }}
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <!-- Columna de fecha personalizada -->
            <template v-slot:item.createdAt="{ item }">
              <span class="text-caption">
                {{ formatDate(item.createdAt) }}
              </span>
            </template>

            <!-- Columna de acciones -->
            <template v-slot:item.actions="{ item }">
            <v-btn
                color="primary"
                variant="outlined"
                size="small"
                :prepend-icon="downloadingIds.has(item.id) ? 'mdi-loading mdi-spin' : 'mdi-download'"
                :loading="downloadingIds.has(item.id)"
                :disabled="downloadingIds.has(item.id)"
                @click="downloadTranscription(item)"
            >
                Descargar
            </v-btn>
            </template>

            <!-- Estado vacío -->
            <template v-slot:no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">
                  mdi-file-document-outline
                </v-icon>
                <p class="text-body-1 text-grey">No hay transcripciones disponibles</p>
              </div>
            </template>

            <!-- Loading -->
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
            </template>
          </v-data-table>

          <!-- Paginación personalizada -->
          <v-card-actions class="justify-space-between">
            <div class="text-caption text-grey">
              Mostrando {{ transcriptions.length }} transcripciones
            </div>
            <div>
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-chevron-left"
                :disabled="!canGoBack || loading"
                @click="previousPage"
                class="mr-2"
              >
                Anterior
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                append-icon="mdi-chevron-right"
                :disabled="!hasMore || loading"
                @click="nextPage"
              >
                Siguiente
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-snackbar
    v-model="showToast"
    :color="toastColor"
    timeout="3000"
    location="top right"
  >
    {{ toastMessage }}
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="showToast = false"
      >
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
const { $api } = useNuxtApp()

// Estado reactivo
const transcriptions = ref([])
const loading = ref(false)
const hasMore = ref(false)
const canGoBack = ref(false)
const currentPage = ref(1)
const downloadingIds = ref(new Set())
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('success')

// Paginación
const nextTokens = ref([])
const currentNextToken = ref(null)

// Headers de la tabla
const headers = [
  { title: 'ID', key: 'id', width: '200px' },
  { title: 'Contenido', key: 'content', sortable: false },
  { title: 'Fecha', key: 'createdAt', width: '180px' },
  { title: 'Acciones', key: 'actions', width: '150px', sortable: false }
]

// Métodos
const fetchTranscriptions = async (nextToken = null) => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('limit', '10')
    if (nextToken) {
      params.append('nextToken', nextToken)
    }

    // Cambia esta URL por la de tu API
    const response = await $api(`https://9dak6tcci9.execute-api.us-east-1.amazonaws.com/dev/transcriptions?${params}`)
    
    transcriptions.value = response.data.items
    hasMore.value = response.data.hasMore
    currentNextToken.value = response.data.nextToken
    
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
  } finally {
    loading.value = false
  }
}

const nextPage = async () => {
  if (!hasMore.value || loading.value) return
  
  nextTokens.value.push(currentNextToken.value)
  await fetchTranscriptions(currentNextToken.value)
  currentPage.value++
  canGoBack.value = true
}

const previousPage = async () => {
  if (!canGoBack.value || loading.value) return
  
  const previousToken = nextTokens.value.pop()
  
  if (nextTokens.value.length === 0) {
    await fetchTranscriptions()
    currentPage.value = 1
    canGoBack.value = false
  } else {
    await fetchTranscriptions(previousToken)
    currentPage.value--
  }
}

const downloadTranscription = async (transcription) => {
  try {
    console.log('Descargando transcripción:', transcription)
    
    // Marcar como descargando
    downloadingIds.value.add(transcription.id)
    
    // Construir la URL del endpoint
    const downloadUrl = `https://9dak6tcci9.execute-api.us-east-1.amazonaws.com/dev/transcriptions/${transcription.id}/download`
    
    // Verificar que el endpoint responde correctamente
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`)
    }
    
    // Obtener el contenido del archivo
    const blob = await response.blob()
    
    // Crear URL temporal para el blob
    const blobUrl = URL.createObjectURL(blob)
    
    // Crear enlace de descarga
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `transcription_${transcription.id}.txt`
    
    // Agregar al DOM y hacer clic
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar la URL temporal
    URL.revokeObjectURL(blobUrl)
    
    // Mostrar mensaje de éxito
    showToastMessage('Archivo descargado exitosamente', 'success')
    
  } catch (error) {
    console.error('Error descargando transcripción:', error)
    
    // Mostrar mensaje de error específico
    if (error.message.includes('404')) {
      showToastMessage('Transcripción no encontrada', 'error')
    } else if (error.message.includes('500')) {
      showToastMessage('Error del servidor. Inténtalo más tarde', 'error')
    } else if (error.name === 'TypeError') {
      showToastMessage('Error de conexión. Verifica tu internet', 'error')
    } else {
      showToastMessage('Error al descargar el archivo', 'error')
    }
  } finally {
    // Quitar del estado de descarga
    downloadingIds.value.delete(transcription.id)
  }
}

const showToastMessage = (message, color = 'info') => {
  toastMessage.value = message
  toastColor.value = color
  showToast.value = true
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchTranscriptions()
})
</script>