import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Hybrid-Intrusion-Detection-System-using-CICIDS-2017-Dataset/',
})
