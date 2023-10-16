import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

/**
 * 考虑的点：
 * 1. 构建 - 排除对 React 库的构建，由外部提供（ok）
 * 2. 构建 - 按照组件目录去构建，能够实现 按需加载（按需引用指定组件）
 *  - umd - dist，（build.lib 可以做到）
 *  - cjs - lib，（这个呢？）
 *  - es - es，（TS 编译输出？）
 * 3. 构建 - TS 输出类型文件 types/**.d.ts（ok）
 * 4. 规范 - 增加 ESLint
 *  - 请注意，Vite 仅执行 .ts 文件的转译工作，并不执行 任何类型检查。并假定类型检查已经被你的 IDE 或构建过程处理了。
 *  - Vite 使用 esbuild 将 TypeScript 转译到 JavaScript，约是 tsc 速度的 20~30 倍，同时 HMR 更新反映到浏览器的时间小于 50ms。
 *  - 安装：
 *    - yarn add eslint eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser -D
 *    - 创建 .eslintrc.js 配置文件
 *    - 编译不做 eslint 处理，依靠 IDE 检查提示。
 * 5. CSS 预处理器 - 不需要额外 loader，只需按照预处理器。https://cn.vitejs.dev/guide/features.html#css-pre-processors
 *
 * 组件设计原则：
 * https://juejin.cn/post/7146022961894391821?searchId=2023093017094980AA1247DDB8803430D6
 * 1. 高内聚，低耦合
 * 2. 可定制，可扩展
 * 3. 友好的警告提示
 */

export default defineConfig((options) => {
  const { mode } = options;
  const isDevelopment = mode === "development";
  const isProduction = mode === "production";

  console.log("mode: ", mode);

  return {
    root: process.cwd(),
    // 静态资源在开发或生产环境服务的公共基础路径，如 .html 中引入打包静态 JS 文件，通常建议使用相对路径
    base: "./",
    plugins: [react()],

    build: {
      target: "es2015",
      outDir: "dist",
      // 生产构建作为库使用
      lib: {
        // 库不能使用 HTML 作为入口，需要指定入口 JS 文件
        entry: resolve(__dirname, "lib/index.ts"),
        // 暴露在 window 上的全局变量（formats 包含 'umd' 或 'iife' 时是必需）
        // name: "cegz-design",
        // 指定输出格式 formats: ('es' | 'cjs' | 'umd' | 'iife')[]
        // formats: ["es", "cjs"],
        formats: ["cjs"],
        // 是输出的包文件名
        fileName: "index",
      },
      rollupOptions: {
        // https://rollupjs.org/configuration-options
        // 排除 React 避免打包到库资源中，由外部去提供
        external: ["react", "react-dom"],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          // 在 es 构建模式下，会处理成 import e from "react"; 需要提供 React 依赖
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
    server: {
      port: 5000,
    },
  };
});
