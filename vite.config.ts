import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * 考虑的点：
 * 1. 构建 - 排除对 React 库的构建，由外部提供（ok）
 * 2. 构建 - 按照组件目录去构建，能够实现 按需加载（按需引用指定组件）
 *  - umd - dist，（build.lib 可以做到）
 *  - cjs - lib，（这个呢？）
 *  - es - es，（TS 编译输出？）
 * 
 * rollup 配置实现打包按照 源码文件目录结构进行分割输出：https://zhuanlan.zhihu.com/p/500883016?utm_id=0
 * https://rollup.nodejs.cn/configuration-options/#output-preservemodules
 *
 *  father 可以完成，其本质是 babel 实现？（https://www.npmjs.com/package/father/v/2.7.3）

 Father 是一个由 UmiJS 团队开发的构建工具，它是基于 Rollup 和 Babel 的，适用于构建现代化的 JavaScript 库。

Father 的工作原理主要分为以下几个步骤：

解析配置：Father 会首先解析用户在 .fatherrc.js 文件中的配置，这些配置包括了 Rollup 的配置以及其他一些 Father 特有的配置。

编译源码：Father 会使用 Babel 来编译源码。用户可以在 .babelrc 文件中自定义 Babel 的配置。

构建：Father 会使用 Rollup 进行构建。Rollup 是一个 JavaScript 模块打包器，它可以将小块代码编译成大块复杂的代码，例如库或应用程序。

输出：Father 支持多种输出格式，包括 ES Modules（esm）、CommonJS（cjs）和 UMD。用户可以在 .fatherrc.js 文件中配置输出格式。如果配置了 esm，Father 会按照源码的文件结构生成对应的 esm 格式的文件。

Father 的一个重要特性是它支持按目录结构输出 esm 文件。这是通过 Rollup 的 preserveModules 选项实现的。当 preserveModules 为 true 时，Rollup 会保持输入文件的目录结构，为每个模块生成一个独立的文件，而不是将所有模块打包到一个文件中。这样，用户就可以按需引入他们需要的模块，而不是整个库。

 *
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
 *
 * 构建组件库功能参考：
 * 1.「从0到1教你搭建前端团队的组件系统（高级进阶必备）」 https://juejin.cn/post/6844904068431740936?searchId=20231019201154BFFEE4A7829127876E60
 *
 * 
 * vite 默认是按照 业务项目 方式打包构建，产出 html、js、css 等静态资源。
 * 指定 lib 配置后，将按照 库 的形式打包，生成 js 文件。
 * 如果期望 vite 作为 组件库 构建，按照组件目录结构输出文件（代码分割），该如何配置？
 */

export default defineConfig((options) => {
  const { mode } = options;
  const isDevelopment = mode === "development";
  const isProduction = mode === "production";

  console.log("mode: ", mode);

  const baseOutput = {
    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
    // 在 es 构建模式下，处理成 import e from "react"; 需要提供 React 依赖
    globals: {
      react: "React",
      "react-dom": "ReactDOM",
    },

    // 1. 取消输出的文件命名前缀 assets 及 hash，默认是 assets/[name]-[hash].js
    entryFileNames: "[name].js",
    chunkFileNames: "[name].js",
    // assetFileNames: "assets/[name][extname]",
    // css 文件输出到 style 目录下
    assetFileNames: ({ name }) => {
      const { ext, dir, base } = path.parse(name || "");
      if (ext !== ".css") return "[name].[ext]";
      // 规范 style 的输出格式
      return path.join(dir, "style", base);
    },

    // 2. 将每个模块文件作为独立的 JS 文件输出（代码分割、按需加载）（参考：https://rollup.nodejs.cn/configuration-options/#output-preservemodules）
    preserveModules: true,
    preserveModulesRoot: "lib", // 起到剥离、扁平化作用，如果不配置，每个模块文件依旧是输出在 lib 下，而非 es 下

    // 3. 构建会生成的 _virtual 虚拟文件，如何阻止生成暂时没有方案。可能跟 @rollup/plugin-commonjs 有关
    // ...
  };

  return {
    root: process.cwd(),
    // 静态资源在开发或生产环境服务的公共基础路径，如 .html 中引入打包静态 JS 文件，通常建议使用相对路径
    base: "./",
    plugins: [react()],

    build: {
      target: "es2015",
      // outDir: "dist",
      // 生产构建作为库使用
      // lib: {
      //   // 库不能使用 HTML 作为入口，需要指定入口 JS 文件
      //   entry: path.resolve(__dirname, "lib/index.ts"),
      //   // 暴露在 window 上的全局变量（formats 包含 'umd' 或 'iife' 时是必需）
      //   // name: "cegz-design",
      //   // 指定输出格式 formats: ('es' | 'cjs' | 'umd' | 'iife')[]
      //   // formats: ["es", "cjs"],
      //   formats: ["cjs"],
      //   // 是输出的包文件名
      //   fileName: "index",
      // },
      rollupOptions: {
        // https://rollupjs.org/configuration-options
        // 排除 React 避免打包到库资源中，由外部去提供
        external: ["react", "react-dom"],
        input: path.resolve(__dirname, "lib/index.ts"),

        // 此属性配合 output.preserveModules 一起使用
        preserveEntrySignatures: "strict", // Rollup 在条目块中创建与相应条目模块中完全相同的导出

        output: [
          {
            dir: "es/",
            format: "es",
            ...baseOutput,
          },
          {
            dir: "dist/",
            format: "cjs",
            ...baseOutput,
          },
        ],
      },
    },
    server: {
      port: 5000,
    },
  };
});
