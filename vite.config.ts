import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite de aviso para 3000kB para evitar avisos na Vercel
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa o core do React
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Separa bibliotecas pesadas em chunks individuais
          supabase: ['@supabase/supabase-js'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
});