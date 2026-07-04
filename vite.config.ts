import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    // 关闭 sourcemap 降低构建内存
    sourcemap: false,
    // 分块打包，降低单块内存峰值
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
        },
      },
    },
    // esbuild 压缩，比 terser 省内存
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
