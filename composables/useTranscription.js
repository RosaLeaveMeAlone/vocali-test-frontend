export const useTranscription = () => {
  const transcribeFile = async (fileName, fileData) => {
    try {
      const { $api } = useNuxtApp();
      
      const response = await $api('/transcribe-file', {
        method: 'POST',
        body: JSON.stringify({ 
          fileName, 
          fileData 
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Transcription failed');
    }
  };

  return { transcribeFile };
};