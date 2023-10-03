# cegz-design, 一个由 Vite 提供 服务和构建 的 UI 组件库，涵盖了业务上常见交互的组件。


## 注意。
1. Node 版本要求
vite 4.4 以上版本，需要使用 Node 16+ 版本去运行，否则你可能会看到报错：`error when starting dev server: Error: Cannot find module 'node:path'`。

2. dev server 端口号
默认启动项目会使用 127.0.0.1:5173 作为访问地址，但只要对浏览器进行刷新，就会出现访问不到服务的现象，可能 5173 端口是被占用了，建议启动 server 时更换端口。