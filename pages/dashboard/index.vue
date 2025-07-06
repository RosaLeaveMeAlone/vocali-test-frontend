<template>
  <div>
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
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const { transcribeFile } = useTranscription()

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