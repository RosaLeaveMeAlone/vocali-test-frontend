// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0];
      
      // Convertir Float32Array a ArrayBuffer
      const buffer = new ArrayBuffer(inputChannel.length * 4);
      const view = new Float32Array(buffer);
      view.set(inputChannel);
      
      // Enviar los datos de audio al hilo principal
      this.port.postMessage(buffer, [buffer]);
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);