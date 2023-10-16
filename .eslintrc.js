// .eslintrc.js
module.exports = {
  env: {
    // 指定代码的运行环境
    browser: true,
    es6: true,
  },
  // 使用 eslint-plugin-react 插件时需要指定 React 版本
  settings: {
    react: {
      version: "18", // or "detect"
    },
  },
  extends: ["plugin:react/recommended"],
  plugins: ["react", "@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest", // 支持 ES 最新版本的语法校验
    sourceType: "module", // 设置 ECMAScript modules
  },
  // rules: https://eslint.bootcss.com/docs/rules/
  rules: {
    // 禁止出现定义了，但未使用过的变量（使用 ts 的规则来校验）
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    // 阻止 var 的使用，推荐用 let 和 const
    "no-var": "warn",
  },
};
