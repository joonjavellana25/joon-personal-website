const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`); // Debug log
  
  // Handle root URL
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  // Get file extension
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Set the file path to serve from the current directory
  let fullPath = path.join(__dirname, filePath);

  // If path resolves to a directory, try to serve its index.html
  try {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fullPath = path.join(__dirname, filePath);
      const newExt = path.extname(filePath);
      contentType = MIME_TYPES[newExt] || 'text/html';
    }
  } catch (e) {
    // If statSync fails, proceed to readFile and handle ENOENT below
  }
  
  // Check if file exists
  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        console.error(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success - serve the file
      console.log(`Serving: ${filePath}`); // Debug log
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
