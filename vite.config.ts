import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // necessário para o Capacitor carregar os arquivos localmente
  build: {
    chunkSizeWarningLimit: 1500, // o Phaser é grande
  },
})
