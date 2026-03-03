import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const prerender = require('vite-plugin-prerender')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/gaokao',
        '/compare',
        '/career/程序员',
        '/career/AI工程师',
        '/career/银行柜员',
        '/career/公务员',
      ],
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4173",
      "/pay": "http://localhost:4173",
    },
  },
})
