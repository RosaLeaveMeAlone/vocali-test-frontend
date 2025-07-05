<template>
  <div>
    <!-- Botones de acción -->
    <TranscriptionActions 
      ref="transcriptionActionsRef"
      @audio-recorded="handleAudioRecorded"
      @file-uploaded="handleFileUploaded"
      @processing-start="handleProcessingStart"
      @processing-end="handleProcessingEnd"
    />

    <!-- Tabla de transcripciones -->
    <div>
      <TranscriptionsTable />
    </div>

    <!-- Modal de carga -->
    <LoadingModal :is-loading="isLoading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Definir el layout a usar
definePageMeta({
  layout: 'dashboard'
})

// Composables
const { transcribeFile } = useTranscription()

// Componentes
import TranscriptionActions from '~/components/transcriptions/TranscriptionActions.vue'
import TranscriptionsTable from '~/components/transcriptions/TranscriptionsTable.vue'
import LoadingModal from '~/components/ui/LoadingModal.vue'

// Variables reactivas
const transcriptions = ref([])
const isLoading = ref(false)
const transcriptionActionsRef = ref(null)

// Función para manejar inicio de procesamiento
const handleProcessingStart = () => {
  isLoading.value = true
}

// Función para manejar fin de procesamiento
const handleProcessingEnd = () => {
  isLoading.value = false
}

// Función para manejar audio grabado
const handleAudioRecorded = async (base64Audio) => {
  await createTranscription(base64Audio, 'audio')
}

// Función para manejar archivo subido
const handleFileUploaded = async (base64File) => {
  await createTranscription(base64File, 'file')
}

// Función para crear transcripción
const createTranscription = async (base64Data, type) => {
  try {
    console.log('Base64 data:', base64Data)
    const timestamp = new Date().getTime()
    
    // Aquí haces la llamada a tu API
    await transcribeFile(timestamp + '.' + type, base64Data)
    
    console.log('Transcripción creada exitosamente')
    
  } catch (error) {
    console.error('Error al crear transcripción:', error)
    alert('Error al crear la transcripción')
  } finally {
    // Terminar el procesamiento en el componente hijo
    if (transcriptionActionsRef.value) {
      transcriptionActionsRef.value.finishProcessing()
    }
  }
}

// Función para descargar transcripción
const handleDownload = (transcription) => {
  const element = document.createElement('a')
  const file = new Blob([transcription.data || 'Contenido de la transcripción'], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = `${transcription.name}.txt`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

// Función para eliminar transcripción
const handleDelete = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta transcripción?')) {
    transcriptions.value = transcriptions.value.filter(t => t.id !== id)
  }
}

// Cargar transcripciones al montar el componente
onMounted(() => {
  // Aquí puedes cargar las transcripciones desde tu API
  // loadTranscriptions()
})
</script>