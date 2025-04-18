#!/usr/bin/env ts-node
import { Command } from 'commander';
import path from 'path';
import { mdToPdf } from '../src/md2pdf';

const program = new Command();

program
  .name('md2pdf')
  .description('将 Markdown 文件转换为 PDF')
  .version('1.0.0')
  .argument('<input>', '输入的 Markdown 文件路径')
  .argument('<output>', '输出的 PDF 文件路径')
  .action(async (input, output) => {
    try {
      const inputPath = path.resolve(process.cwd(), input);
      const outputPath = path.resolve(process.cwd(), output);
      await mdToPdf(inputPath, outputPath);
      console.log(`转换成功: ${outputPath}`);
    } catch (err: any) {
      console.error('转换失败:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
