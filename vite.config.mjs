import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  base: '',
  plugins: [
    react(),
    viteSingleFile()
  ],
  build: {
    outDir: '../docs',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
