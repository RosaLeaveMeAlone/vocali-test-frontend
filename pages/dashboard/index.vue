<template>
  <div>
    <!-- Show loading screen only if explicitly not authenticated and ready -->
    <div v-if="showLoadingScreen" class="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div class="text-center text-white">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-lg">Cargando...</p>
      </div>
    </div>

    <!-- Dashboard content - only show when hydrated and authenticated -->
    <div v-if="showContent">
      <TranscriptionActions 
        ref="transcriptionActionsRef"
        @audio-recorded="handleAudioRecorded"
        @file-uploaded="handleFileUploaded"
        @processing-start="handleProcessingStart"
        @processing-end="handleProcessingEnd"
      />

      <div>
        <TranscriptionsTable />
      </div>

      <LoadingModal :is-loading="isLoading" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { transcribeFile } = useTranscription()
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

import TranscriptionActions from '~/components/transcriptions/TranscriptionActions.vue'
import TranscriptionsTable from '~/components/transcriptions/TranscriptionsTable.vue'
import LoadingModal from '~/components/ui/LoadingModal.vue'

const transcriptions = ref([])
const isLoading = ref(false)
const transcriptionActionsRef = ref(null)

const handleProcessingStart = () => {
  isLoading.value = true
}

const handleProcessingEnd = () => {
  isLoading.value = false
}

const handleAudioRecorded = async (base64Audio) => {
  await createTranscription(base64Audio, 'audio')
}

const handleFileUploaded = async (base64File) => {
  await createTranscription(base64File, 'file')
}

const createTranscription = async (base64Data, type) => {
  try {
    console.log('Base64 data:', base64Data)
    const timestamp = new Date().getTime()
    
    await transcribeFile(timestamp + '.' + type, base64Data)
    
    console.log('Transcripción creada exitosamente')
    
  } catch (error) {
    console.error('Error al crear transcripción:', error)
    alert('Error al crear la transcripción')
  } finally {
    if (transcriptionActionsRef.value) {
      transcriptionActionsRef.value.finishProcessing()
    }
  }
}

const handleDownload = (transcription) => {
  const element = document.createElement('a')
  const file = new Blob([transcription.data || 'Contenido de la transcripción'], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = `${transcription.name}.txt`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const handleDelete = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta transcripción?')) {
    transcriptions.value = transcriptions.value.filter(t => t.id !== id)
  }
}

</script>