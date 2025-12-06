import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite de aviso de tamanho do chunk para 1600kB (o padrão é 500kB).
    // Isso resolve o aviso "Adjust chunk size limit for this warning via build.chunkSizeWarningLimit"
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa bibliotecas essenciais e grandes em chunks dedicados para melhor cache e performance
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
});