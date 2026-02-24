#!/usr/bin/env node

/**
 * Simple HTTP server for serving API documentation locally
 * Usage: node serve.js [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8080;
const DOCS_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DOCS_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(DOCS_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ReplayDash API Documentation Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📚 Documentation: http://localhost:${PORT}`);
  console.log(`📄 OpenAPI JSON:  http://localhost:${PORT}/openapi.json`);
  console.log(`📄 OpenAPI YAML:  http://localhost:${PORT}/openapi.yaml`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});
