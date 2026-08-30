const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split('?')[0]);
  const target = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!target.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(404); return response.end('Not found'); }
    response.writeHead(200, {'Content-Type': mime[path.extname(target)] || 'application/octet-stream'});
    response.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('VetCare: http://127.0.0.1:4173'));
