// 自动修正 dist/bin/md2pdf.js 的 shebang 为 #!/usr/bin/env node
const fs = require('fs');
const path = 'dist/bin/md2pdf.js';
if (fs.existsSync(path)) {
  let content = fs.readFileSync(path, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    // 替换第一行为 node shebang
    content = content.replace(/^#!.*\n/, '#!/usr/bin/env node\n');
    fs.writeFileSync(path, content, 'utf8');
    console.log('已自动修正 shebang 为 #!/usr/bin/env node');
  }
}
