#!/usr/bin/env ts-node
/**
 * md2pdf 命令行入口
 * 支持将 Markdown 文件/目录批量转换为 PDF，兼容本地图片、代码块高亮、多字体。
 * 
 * 用法示例：
 *   md2pdf <input> [output] [--ext .pdf]
 * 
 * @author mofanx <mofanx@qq.com>
 * @license MIT
 */
import { Command } from 'commander';
import path from 'path';
import { mdToPdf } from '../src/md2pdf';

const program = new Command();

program
  .name('md2pdf')
  .description('将 Markdown 文件或目录批量转换为 PDF')
  .version('1.0.0')
  .argument('<input>', '输入的 Markdown 文件或目录路径')
  .argument('[output]', '输出的 PDF 文件路径或目录，可选')
  .option('--ext <ext>', '输出 PDF 文件后缀名', '.pdf')
  .action(async (input, output, opts) => {
    const fs = await import('fs');
    const inputPath = path.resolve(process.cwd(), input);
    const outputPath = output ? path.resolve(process.cwd(), output) : '';
    const ext = opts.ext || '.pdf';
    const isDir = fs.existsSync(inputPath) && fs.statSync(inputPath).isDirectory();
    if (!isDir) {
      // 单文件
      if (!outputPath) {
        console.error('单文件转换需指定输出 PDF 路径');
        process.exit(1);
      }
      await mdToPdf(inputPath, outputPath);
      console.log(`转换成功: ${outputPath}`);
    } else {
      // 目录批量
      const outDir = outputPath || path.join(process.cwd(), 'md2pdf_out');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const walk = (dir: string): string[] => {
        let files: string[] = [];
        for (const item of fs.readdirSync(dir)) {
          const full = path.join(dir, item);
          if (fs.statSync(full).isDirectory()) files = files.concat(walk(full));
          else if (/\.md$/i.test(item)) files.push(full);
        }
        return files;
      };
      const mdFiles = walk(inputPath);
      if (mdFiles.length === 0) {
        console.warn('目录下未找到 Markdown 文件');
        process.exit(0);
      }
      for (const md of mdFiles) {
        const rel = path.relative(inputPath, md).replace(/\.md$/i, ext);
        const pdfPath = path.join(outDir, rel);
        const pdfDir = path.dirname(pdfPath);
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
        await mdToPdf(md, pdfPath);
        console.log(`转换成功: ${pdfPath}`);
      }
    }
  });

program.parse(process.argv);

