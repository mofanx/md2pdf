# md2pdf

> 一款支持本地图片、批量转换、字体优化和高质量排版的 Markdown 转 PDF 命令行工具。

---

## 功能特性

- 支持将单个 Markdown 文件或整个文件夹批量转换为 PDF
- 自动处理本地图片，嵌入 PDF，100% 显示无丢失
- 代码块高亮、自动换行，防止内容溢出或遮挡
- 多字体兼容，适配中英文、代码等多场景
- 可自定义输出文件夹、PDF 后缀名
- 支持全局安装，一键 md2pdf 命令

---

## 安装方法

### 1. npm 作用域包安装（推荐普通用户）

```bash
npm install -g @mofanx/md2pdf
# 或 pnpm add -g @mofanx/md2pdf
```

### 2. 全局安装（开发者本地源码）

```bash
# 克隆仓库
https://github.com/mofanx/md2pdf.git
cd md2pdf

# 安装依赖
mamba install nodejs
pnpm install

# 全局安装
pnpm build # 或 tsc
pnpm add -g .
# 或 npm install -g .
```

### 3. 直接用 ts-node

```bash
pnpm dlx ts-node bin/md2pdf.ts <输入> [输出]
```

---

### 关于 Puppeteer 和 Chrome

首次安装 puppeteer 时会自动下载 Chromium（如需更小体积或用系统 Chrome，可参考 puppeteer 官方文档配置 PUPPETEER_EXECUTABLE_PATH 环境变量）。

如遇国内网络问题，可参考：

```bash
# 指定镜像源加速 puppeteer 安装
PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors/chromium/ pnpm install
```

或直接使用系统已安装的 Chrome/Chromium。

详细说明见：https://pptr.dev/guides/configuration

---

## 使用方法

### 单文件转换

```bash
md2pdf test.md test.pdf
```

### 批量转换（目录）

```bash
md2pdf ./docs ./out
# 会将 docs 下所有 .md 转为 out 下同目录结构的 .pdf
```

### 更多参数

- `--ext <ext>` 指定输出 PDF 后缀名（默认 .pdf）

```bash
md2pdf ./docs ./out --ext .pdf
```

---

## 主要技术点

- puppeteer 渲染 HTML 转 PDF，支持本地 file:// 图片自动转 base64，彻底解决图片丢失问题
- 代码块、图片、字体等样式高度优化，适合技术文档、中文内容
- 支持多种字体优先级，兼容 JetBrains Mono、Noto Serif CJK、Maple Mono 等

---

## 常见问题

- **图片无法显示？**
  - 工具已自动将本地图片转为 base64，无需手动处理。
- **PDF 代码块显示不全？**
  - 已优化样式，自动换行、增大行高，适配所有内容。
- **字体不理想？**
  - 可在系统安装更多字体，或自定义 CSS。

---

## 贡献

欢迎提交 Issue 或 PR！

---

## License

MIT
