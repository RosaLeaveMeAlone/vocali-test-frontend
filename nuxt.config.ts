import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  plugins: ['~/plugins/axios.js'],
  modules: ['vuetify-nuxt-module'],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL 
    }
  },
})