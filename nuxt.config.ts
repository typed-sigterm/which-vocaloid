export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
  ],

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
    ],
  },

  app: {
    head: {
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
        'canvas-confetti',
      ],
    },
  },

  fonts: {
    provider: 'bunny',
    providers: {
      google: false,
      googleicons: false,
    },
  },

  icon: {
    clientBundle: {
      scan: true,
    },
  },
});
