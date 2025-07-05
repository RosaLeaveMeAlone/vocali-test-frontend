export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  console.log('API Base URL:', config.public.apiBaseUrl)

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    
    // Interceptor para requests - aquí forzamos el Content-Type
    onRequest({ request, options }) {
      console.log('Making request to:', request)
      console.log('Request options:', options)
      
      // Forzar Content-Type para todas las peticiones POST
      if (options.method === 'POST' || options.method === 'PUT') {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
      
      // Agregar token si existe
      const token = useCookie('auth-token')
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    
    onResponse({ response }) {
      console.log('Response:', response.status, response.url)
    },
    
    onResponseError({ request, response }) {
      console.error('API Error:', {
        url: request,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response._data
      })
    }
  })

  return {
    provide: {
      api,
    },
  }
})