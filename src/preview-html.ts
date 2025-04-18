import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('用法: pnpm dlx ts-node src/preview-html.ts <md文件路径>');
    process.exit(1);
  }
  if (!fs.existsSync(inputPath)) {
    console.error('输入文件不存在:', inputPath);
    process.exit(1);
  }
  const mdContent = fs.readFileSync(inputPath, 'utf-8');
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  let htmlContent = md.render(mdContent);
  const mdDir = path.dirname(path.resolve(inputPath));
  // 替换本地图片路径为 file:// 绝对路径
  htmlContent = htmlContent.replace(/<img([^>]*?)src=(["'])([^"'>]+)\2([^>]*)>/gi, (match, pre, q, src, post) => {
    if (/^(http|https|data):/i.test(src)) return match;
    let absPath = src.startsWith('/') ? src : path.join(mdDir, src);
    absPath = path.resolve(absPath);
    absPath = decodeURIComponent(absPath);
    return `<img${pre}src=${q}file://${absPath}${q}${post}>`;
  });
  const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>md2pdf-preview</title>
        <style>
          body { font-family: 'Arial', 'Microsoft YaHei', sans-serif; margin: 40px; }
          pre, code { background: #f5f5f5; border-radius: 4px; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;
  // 写入临时 html 文件
  const tmpHtmlPath = path.join(mdDir, '__md2pdf_preview.html');
  fs.writeFileSync(tmpHtmlPath, html, 'utf-8');
  // 用 puppeteer 有头模式打开
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--enable-local-file-accesses'
    ],
  });
  const page = await browser.newPage();
  await page.goto('file://' + tmpHtmlPath);
  console.log('已在浏览器中打开，按F12可查看控制台和网络面板。');
}

main();
