export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  console.log('API Base URL:', config.public.apiBaseUrl)

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    
    onRequest({ request, options }) {
      
      if (options.method === 'POST' || options.method === 'PUT') {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }
      
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