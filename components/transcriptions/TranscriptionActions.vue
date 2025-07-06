<template>
  <div class="audio-controls">
    <button 
      @click="isRecording ? stopRecording() : startRecording()"
      class="btn-primary"
      :disabled="isProcessing"
    >
      <span v-if="isRecording">⏹️ Detener Grabación ({{ recordingTime }}s)</span>
      <span v-else-if="isProcessing">🔄 Procesando...</span>
      <span v-else>🎙️ Crear Transcripción</span>
    </button>
    
    <button 
      @click="triggerFileUpload"
      class="btn-secondary"
      :disabled="isProcessing || isRecording"
    >
      📁 Subir Archivo
    </button>
    
    <input 
      ref="fileInput"
      type="file" 
      accept="audio/*" 
      @change="handleFileUpload"
      class="file-input-hidden"
    >
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const emit = defineEmits(['audio-recorded', 'file-uploaded', 'processing-start', 'processing-end'])

const isRecording = ref(false)
const isProcessing = ref(false)
const recordingTime = ref(0)
const fileInput = ref(null)

let mediaRecorder = null
let audioChunks = []
let recordingInterval = null

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    
    audioChunks = []
    recordingTime.value = 0
    isRecording.value = true
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }
    
    mediaRecorder.onstop = async () => {
      isProcessing.value = true
      emit('processing-start')
      
      try {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const wavBlob = audioBufferToWav(audioBuffer)
        const base64Audio = await convertToBase64(wavBlob)
        
        const base64Data = base64Audio.split(',')[1]
        
        stream.getTracks().forEach(track => track.stop())
        
        emit('audio-recorded', base64Data)
        
      } catch (error) {
        console.error('Error procesando audio:', error)
        alert('Error procesando el audio')
        emit('processing-end')
        isProcessing.value = false
      }
    }
    
    mediaRecorder.start()
    
    recordingInterval = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 30) {
        stopRecording()
      }
    }, 1000)
    
  } catch (error) {
    console.error('Error al acceder al micrófono:', error)
    alert('Error al acceder al micrófono')
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false
  clearInterval(recordingInterval)
}

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    isProcessing.value = true
    emit('processing-start')
    
    try {
      const base64File = await convertToBase64(file)
      const base64Data = base64File.split(',')[1]
      emit('file-uploaded', base64Data)
    } catch (error) {
      console.error('Error procesando archivo:', error)
      alert('Error procesando el archivo')
      emit('processing-end')
      isProcessing.value = false
    }
  }
  
  event.target.value = ''
}

const finishProcessing = () => {
  isProcessing.value = false
  emit('processing-end')
}

defineExpose({
  finishProcessing
})

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

const audioBufferToWav = (buffer) => {
  const length = buffer.length
  const arrayBuffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(arrayBuffer)
  
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)
  
  const channelData = buffer.getChannelData(0)
  let offset = 44
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

onUnmounted(() => {
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
})
</script>

<style scoped>
.audio-controls {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease-in-out;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #2563eb;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #059669;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease-in-out;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #047857;
}

.btn-secondary:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #059669;
}

.btn-secondary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.file-input-hidden {
  display: none;
}

/* Asegurar que los botones sean visibles */
.audio-controls button {
  z-index: 1;
  position: relative;
}
</style>