import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// Lấy từ env hoặc fallback sang thời gian hiện tại
const deployTime = process.env.DEPLOY_TIME || new Date().toLocaleString('vi-VN', { hour12: false })

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __DEPLOY_TIME__: JSON.stringify(deployTime),
  },
})
