class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0];
      
      const buffer = new ArrayBuffer(inputChannel.length * 4);
      const view = new Float32Array(buffer);
      view.set(inputChannel);
      
      this.port.postMessage(buffer, [buffer]);
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);