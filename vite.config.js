import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about/index.html'),
        products: resolve(__dirname, 'products/index.html'),
        support: resolve(__dirname, 'support/index.html'),
        vida: resolve(__dirname, 'vida/index.html'),
        pass: resolve(__dirname, 'pass/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
