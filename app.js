// Import required core modules
const http = require('http');
const fs = require('fs');
const path = require('path');

// Define the port for the HTTP server
const PORT = 3000;

// Helper function to send HTTP response
const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Create the HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL and the query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = path.join(__dirname, 'files', url.pathname);

  // Ensure the directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      // Create or overwrite a file
      let fileContent = '';
      req.on('data', chunk => {
        fileContent += chunk;
      });

      req.on('end', () => {
        fs.writeFile(filePath, fileContent, err => {
          if (err) {
            sendResponse(res, 500, { error: 'Failed to write file' });
          } else {
            sendResponse(res, 200, { message: 'File created successfully' });
          }
        });
      });
      break;

    case 'GET':
      // Read the contents of a file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            sendResponse(res, 404, { error: 'File not found' });
          } else {
            sendResponse(res, 500, { error: 'Failed to read file' });
          }
        } else {
          sendResponse(res, 200, { content: data });
        }
      });
      break;

    case 'DELETE':
      // Delete a file
      fs.unlink(filePath, err => {
        if (err) {
          if (err.code === 'ENOENT') {
            sendResponse(res, 404, { error: 'File not found' });
          } else {
            sendResponse(res, 500, { error: 'Failed to delete file' });
          }
        } else {
          sendResponse(res, 200, { message: 'File deleted successfully' });
        }
      });
      break;

    default:
      // Handle unsupported methods
      sendResponse(res, 405, { error: 'Method not allowed' });
      break;
  }
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
