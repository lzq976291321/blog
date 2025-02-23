import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 插件配置
  plugins: [
    // 添加 React 支持
    react(),
  ],

  // 开发服务器配置
  server: {
    // 指定开发服务器端口
    port: 3000,
    // 监听所有网络接口
    host: "0.0.0.0",
    // 热模块替换配置
    hmr: {
      // 禁用错误覆盖层
      overlay: false,
    },
    // 文件监听配置
    watch: {
      // 使用轮询方式监听文件变化，解决某些系统下监听失效问题
      usePolling: true,
    },
  },

  // 路径解析配置
  resolve: {
    alias: {
      // 设置 @ 指向 src 目录，方便导入
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  // CSS 相关配置
  css: {
    // CSS 模块化配置
    modules: {
      // 将 kebab-case 类名转换为 camelCase
      localsConvention: "camelCase",
    },
    // 预处理器配置
    preprocessorOptions: {
      less: {
        // 启用 Less 中的 JavaScript 表达式
        javascriptEnabled: true,
      },
    },
  },

  // 构建配置
  build: {
    // 指定输出目录
    outDir: "dist",
    // 生成 source map
    sourcemap: true,
    // 调整打包大小警告阈值（单位：kb）
    chunkSizeWarningLimit: 1500,
    // Rollup 打包配置
    rollupOptions: {
      external: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
      output: {
        // 手动分包配置
        manualChunks: {
          // React 相关库单独打包
          vendor: ["react", "react-dom"],
          // Ant Design 单独打包
          antd: ["antd"],
        },
      },
    },
  },

  // 依赖优化配置
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
});
