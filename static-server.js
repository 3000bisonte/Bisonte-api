const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let filePath = parsedUrl.pathname;
  
  // Handle root path
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Handle directory paths (add index.html)
  if (!path.extname(filePath) && !filePath.endsWith('/')) {
    filePath += '/index.html';
  }
  if (filePath.endsWith('/')) {
    filePath += 'index.html';
  }
  
  const fullPath = path.join(__dirname, 'out', filePath);
  
  try {
    const content = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath);
    
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.ico') contentType = 'image/x-icon';
    else if (ext === '.json') contentType = 'application/json';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    console.log('✓ Served:', filePath);
  } catch (err) {
    console.log('✗ 404 for:', parsedUrl.pathname, 'tried:', fullPath);
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><body><h1>404 - Not Found</h1><p>The requested file was not found.</p></body></html>');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📁 Serving files from: ./out/');
  console.log('🏠 Main page: http://localhost:3001');
  console.log('🏡 Home page: http://localhost:3001/home');
});
