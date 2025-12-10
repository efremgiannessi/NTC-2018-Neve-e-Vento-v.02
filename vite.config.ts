import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Netlify serves from root by default, so we remove "base: './'"
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});