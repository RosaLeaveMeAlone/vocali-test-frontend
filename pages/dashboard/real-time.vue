<template>
  <div class="real-time-transcription">
    <!-- Show loading screen only if explicitly not authenticated and ready -->
    <div v-if="showLoadingScreen" class="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div class="text-center text-white">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-lg">Cargando...</p>
      </div>
    </div>

    <!-- Real-time content - only show when hydrated and authenticated -->
    <div v-if="showContent">
    <v-card class="pa-6">
      <v-card-title class="text-h5 mb-4">
        Transcripción en Tiempo Real
      </v-card-title>

      <div class="controls mb-6">
        <v-btn
          @click="toggleRecording"
          :color="isRecording ? 'red' : 'primary'"
          :loading="isConnecting"
          size="large"
          class="mr-4"
        >
          <v-icon class="mr-2">
            {{ isRecording ? 'mdi-stop' : 'mdi-microphone' }}
          </v-icon>
          {{ isRecording ? 'Detener' : 'Iniciar' }} Transcripción
        </v-btn>

        <v-chip
          :color="isRecording ? 'success' : 'default'"
          variant="outlined"
        >
          {{ isRecording ? 'Grabando...' : 'Detenido' }}
        </v-chip>
      </div>

      <v-card
        variant="outlined"
        class="transcript-area pa-4"
        min-height="300"
      >
        <div class="transcript-content">
          <span class="final-text">{{ finalTranscript }}</span>
          
          <span v-if="partialTranscript" class="partial-text">
            {{ partialTranscript }}
          </span>
          
          <span v-if="isRecording && !partialTranscript" class="recording-indicator">
            Escuchando...
          </span>
          
          <div v-if="!finalTranscript && !partialTranscript && !isRecording" class="empty-state">
            <v-icon size="48" color="grey-lighten-2" class="mb-2">
              mdi-microphone-outline
            </v-icon>
            <p class="text-grey text-body-2">
              Haz clic en "Iniciar Transcripción" para comenzar
            </p>
          </div>
        </div>
      </v-card>

      <div class="actions mt-4">
        <v-btn
          @click="clearTranscript"
          variant="outlined"
          :disabled="!finalTranscript"
          class="mr-2"
        >
          <v-icon class="mr-2">mdi-delete</v-icon>
          Limpiar
        </v-btn>

        <v-btn
        @click="saveTranscript"
        variant="outlined"
        :disabled="!finalTranscript || isSaving"
        :loading="isSaving"
        class="mr-2"
        data-save-btn
        >
            <v-icon class="mr-2">mdi-content-save</v-icon>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </v-btn>

        <v-btn
          @click="copyToClipboard"
          variant="outlined"
          :disabled="!finalTranscript"
        >
          <v-icon class="mr-2">mdi-content-copy</v-icon>
          Copiar
        </v-btn>
      </div>

      <v-snackbar
        v-model="showToast"
        :color="toastColor"
        timeout="3000"
      >
        {{ toastMessage }}
      </v-snackbar>
    </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
const { $api } = useNuxtApp()
const { token } = useAuth()

const isHydrated = ref(false)
const showContent = computed(() => {
  if (!isHydrated.value) return false
  return !!token.value
})

const showLoadingScreen = computed(() => {
  return !isHydrated.value || (isHydrated.value && !token.value)
})

onMounted(() => {
  setTimeout(() => {
    isHydrated.value = true
  }, 50)
})

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const isRecording = ref(false)
const isConnecting = ref(false)
const finalTranscript = ref('')
const partialTranscript = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('success')
const isSaving = ref(false)

let mediaStream = null
let audioContext = null
let processor = null
let websocket = null

const SPEECHMATICS_CONFIG = {
  language: 'es', 
  enablePartials: true,
  maxDelay: 2,
  websocketUrl: 'wss://eu2.rt.speechmatics.com/v2'
}

const fetchJWT = async () => {
  try {
    const response = await $api('/speechmatics-token', {
      method: 'POST',
      body: { ttl: 3600 }
    })
    return response.data.token
  } catch (error) {
    console.error('Error obteniendo JWT:', error)
    throw error
  }
}

const toggleRecording = async () => {
  if (isRecording.value) {
    await stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    isConnecting.value = true

    const jwt = await fetchJWT()
    console.log('JWT obtenido:', jwt.substring(0, 20) + '...')

    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    const websocketUrl = `${SPEECHMATICS_CONFIG.websocketUrl}?jwt=${jwt}`
    console.log('Conectando a:', websocketUrl.replace(jwt, 'JWT_TOKEN_HIDDEN'))
    
    websocket = new WebSocket(websocketUrl)

    websocket.onopen = () => {
      console.log('WebSocket conectado')
      
      const startMessage = {
        message: 'StartRecognition',
        audio_format: {
          type: 'raw',
          encoding: 'pcm_f32le',
          sample_rate: 16000
        },
        transcription_config: {
          language: SPEECHMATICS_CONFIG.language,
          enable_partials: SPEECHMATICS_CONFIG.enablePartials,
          max_delay: SPEECHMATICS_CONFIG.maxDelay
        }
      }
      console.log('Iniciando reconocimiento...')
      websocket.send(JSON.stringify(startMessage))
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Mensaje recibido:', data)
      
      if (data.message === 'RecognitionStarted') {
        console.log('Reconocimiento iniciado, configurando audio...')
        setupAudioProcessing()
        isRecording.value = true
        isConnecting.value = false
        showToastMessage('Transcripción iniciada', 'success')
      } else {
        handleWebSocketMessage(data)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      showToastMessage('Error de conexión', 'error')
      stopRecording()
    }

    websocket.onclose = (event) => {
      console.log('WebSocket cerrado:', event.code, event.reason)
      if (event.code === 4001) {
        showToastMessage('Error de autenticación: Token inválido', 'error')
      } else if (event.code === 4003) {
        showToastMessage('Error: Token expirado', 'error')
      } else if (event.code === 4004) {
        showToastMessage('Error: Idioma no soportado', 'error')
      } else if (event.code === 4005) {
        showToastMessage('Error: Límite de conexiones alcanzado', 'error')
      } else if (event.code !== 1000) {
        showToastMessage('Conexión perdida', 'error')
      }
    }

  } catch (error) {
    console.error('Error iniciando grabación:', error)
    showToastMessage('Error: ' + error.message, 'error')
    isConnecting.value = false
  }
}

const setupAudioProcessing = async () => {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    })
    
    const source = audioContext.createMediaStreamSource(mediaStream)
    
    processor = audioContext.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = (event) => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        const inputBuffer = event.inputBuffer
        const audioData = inputBuffer.getChannelData(0)
        
        const buffer = new ArrayBuffer(audioData.length * 4)
        const view = new Float32Array(buffer)
        view.set(audioData)
        
        websocket.send(buffer)
      }
    }
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    console.log('Procesamiento de audio configurado')
    
  } catch (error) {
    console.error('Error configurando audio:', error)
    showToastMessage('Error configurando audio', 'error')
  }
}

const handleWebSocketMessage = (data) => {
  switch (data.message) {
    case 'AddPartialTranscript':
      const partialText = data.results
        ?.map(r => r.alternatives?.[0]?.content)
        .join(' ') || ''
      partialTranscript.value = partialText
      break
      
    case 'AddTranscript':
      const text = data.results
        ?.map(r => r.alternatives?.[0]?.content)
        .join(' ') || ''
      finalTranscript.value += text + ' '
      partialTranscript.value = ''
      break
      
    case 'EndOfTranscript':
      console.log('Transcripción finalizada')
      break
      
    case 'Warning':
      console.warn('Speechmatics warning:', data)
      showToastMessage('Advertencia: ' + data.reason, 'warning')
      break
      
    case 'Error':
      console.error('Speechmatics error:', data)
      showToastMessage('Error: ' + data.reason, 'error')
      if (data.type === 'not_authorised') {
        stopRecording()
      }
      break

    case 'RecognitionStarted':
      console.log('Reconocimiento iniciado')
      break

    default:
      console.log('Mensaje no manejado:', data.message, data)
  }
}

const stopRecording = async () => {
  isRecording.value = false
  isConnecting.value = false
  partialTranscript.value = ''

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  if (audioContext && audioContext.state !== 'closed') {
    if (processor) {
      processor.disconnect()
      processor = null
    }
    await audioContext.close()
    audioContext = null
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ message: 'EndOfStream' }))
    websocket.close(1000, 'Session ended')
    websocket = null
  }

  showToastMessage('Transcripción detenida', 'info')
}

const clearTranscript = () => {
  finalTranscript.value = ''
  partialTranscript.value = ''
  showToastMessage('Transcripción limpiada', 'info')
}

const saveTranscript = async () => {
  try {
    if (!finalTranscript.value.trim()) {
      showToastMessage('No hay contenido para guardar', 'warning')
      return
    }

    isSaving.value = true

    const response = await $api('/transcriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: finalTranscript.value.trim(),
        type: 'real-time'
      })
    })

    console.log('Transcripción guardada:', response)
    showToastMessage('Transcripción guardada exitosamente', 'success')
    
  } catch (error) {
    console.error('Error guardando transcripción:', error)
    
    if (error.response) {
      const status = error.response.status
      if (status === 400) {
        showToastMessage('Error de validación: Revisa el contenido', 'error')
      } else if (status === 500) {
        showToastMessage('Error del servidor: Intenta más tarde', 'error')
      } else {
        showToastMessage(`Error ${status}: ${error.response.statusText}`, 'error')
      }
    } else if (error.name === 'FetchError') {
      showToastMessage('Error de conexión: Verifica tu internet', 'error')
    } else {
      showToastMessage('Error inesperado al guardar', 'error')
    }
  } finally {
    isSaving.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(finalTranscript.value)
    showToastMessage('Copiado al portapapeles', 'success')
  } catch (error) {
    console.error('Error copiando:', error)
    showToastMessage('Error al copiar', 'error')
  }
}

const showToastMessage = (message, color = 'info') => {
  toastMessage.value = message
  toastColor.value = color
  showToast.value = true
}

onUnmounted(() => {
  stopRecording()
})
</script>

<style scoped>
.transcript-area {
  background-color: #fafafa;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.transcript-content {
  font-family: 'Roboto Mono', monospace;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.final-text {
  color: #2c3e50;
}

.partial-text {
  color: #7f8c8d;
  font-style: italic;
}

.recording-indicator {
  color: #e74c3c;
  animation: pulse 1.5s infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #bdc3c7;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>