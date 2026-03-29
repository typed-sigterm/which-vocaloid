export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  app: {
    head: {
      htmlAttrs: { lang: 'en-US' },
      title: 'Which Vocaloid',
      meta: [
        { name: 'description', content: 'Guess what language a Vocaloid song is in!' },
      ],
    },
  },

  css: ['~/main.css'],

  compatibilityDate: '2026-03-28',

  ssr: false,

  devServer: {
    port: 10508,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
});
