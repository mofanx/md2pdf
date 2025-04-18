import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';

/**
 * 将 Markdown 文件转换为 PDF
 * @param inputPath 输入的md文件路径
 * @param outputPath 输出的pdf文件路径
 */
export async function mdToPdf(inputPath: string, outputPath: string) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`输入文件不存在: ${inputPath}`);
  }
  const mdContent = fs.readFileSync(inputPath, 'utf-8');
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  let htmlContent = md.render(mdContent);

  // 获取 md 文件所在目录
  const mdDir = path.dirname(path.resolve(inputPath));

  // 本地图片转 base64 data URI，网络图片保持原样
  htmlContent = htmlContent.replace(/<img([^>]*?)src=(\"|\')([^\"'>]+)\2([^>]*)>/gi, (match, pre, q, src, post) => {
    if (/^(http|https|data):/i.test(src)) return match;
    let absPath = src.startsWith('/') ? src : path.join(mdDir, src);
    absPath = path.resolve(absPath);
    absPath = decodeURIComponent(absPath);
    try {
      const ext = path.extname(absPath).toLowerCase().replace('.', '');
      const mime =
        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
        ext === 'png' ? 'image/png' :
        ext === 'gif' ? 'image/gif' :
        ext === 'svg' ? 'image/svg+xml' :
        ext === 'webp' ? 'image/webp' :
        ext === 'bmp' ? 'image/bmp' :
        ext === 'ico' ? 'image/x-icon' :
        'application/octet-stream';
      const imgData = fs.readFileSync(absPath);
      const base64 = imgData.toString('base64');
      return `<img${pre}src=${q}data:${mime};base64,${base64}${q}${post}>`;
    } catch (e) {
      // 读取失败则原样返回
      return match;
    }
  });

  const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <base href="file://${mdDir}/">
        <title>md2pdf</title>
        <style>
          body {
            font-family: 'JetBrains Maple Mono', 'Noto Serif CJK SC', 'Microsoft YaHei', 'Arial', 'SimSun', 'SimHei', 'PingFang SC', 'Source Han Serif SC', serif;
            margin: 40px;
          }
          pre, code {
            background: #f5f5f5;
            border-radius: 4px;
            font-size: 14px;
            padding: 8px;
            white-space: pre-wrap;
            word-break: break-all;
            overflow-x: auto;
            line-height: 1.7;
            font-family: 'JetBrains Maple Mono', 'JetBrains Mono', 'Noto Sans Mono CJK SC', 'Maple Mono', 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', 'monospace';
          }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--enable-local-file-accesses'
    ],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // 等待所有图片加载完成，最大等待10秒，输出未加载图片src
  await page.evaluate(async () => {
    function waitImg(img: HTMLImageElement) {
      if (img.complete) return Promise.resolve({src: img.src, ok: true});
      return new Promise<{src: string, ok: boolean}>(resolve => {
        const timer = setTimeout(() => resolve({src: img.src, ok: false}), 10000);
        img.onload = () => { clearTimeout(timer); resolve({src: img.src, ok: true}); };
        img.onerror = () => { clearTimeout(timer); resolve({src: img.src, ok: false}); };
      });
    }
    const imgs = Array.from(document.images) as HTMLImageElement[];
    const results = await Promise.all(imgs.map(waitImg));
    const failed = results.filter(r => !r.ok).map(r => r.src);
    if (failed.length > 0) {
      // @ts-ignore
      window.__md2pdf_failed_imgs = failed;
    }
  });
  // 获取未加载成功图片src并打印
  const failedImgs = await page.evaluate('window.__md2pdf_failed_imgs');
  if (failedImgs && Array.isArray(failedImgs) && failedImgs.length > 0) {
    console.warn('以下图片未能成功加载到PDF：');
    failedImgs.forEach((src: string) => console.warn(src));
  }

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });
  await browser.close();
}
