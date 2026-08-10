const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname; // 网站根目录

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url);
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 文件不存在 → 返回自定义 404 页面
      fs.readFile(path.join(ROOT, '404.html'), (err404, data) => {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        if (err404) {
          res.end('<h1>404 Not Found</h1>');
        } else {
          res.end(data);
        }
      });
    } else {
      // 文件存在 → 正常返回
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          // 简单设置 MIME 类型（此处省略，静态文件基本没问题）
          res.writeHead(200);
          res.end(data);
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`本地服务器运行在 http://localhost:${PORT}`);
});