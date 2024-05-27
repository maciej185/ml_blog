import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    fallback: { 'path': require.resolve('path-browserify') },
    extensions: ['.jsx', '.js', '.tsx', '.ts'],
 }
})
