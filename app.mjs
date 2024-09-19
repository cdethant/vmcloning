/*import { createServer } from 'node:http';
const hostname = 'localhost';
const port = 3000;
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

// app.js
// app.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Use the fileURLToPath function to get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
// NOTE: good practice to change 'task' to 'public'
app.use(express.static(path.join(__dirname, 'task')));

// Route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'task', 'demo.html'));
});

app.use(express.json());

// API route to handle POST requests
app.post('/save-data', (req, res) => {
    const { gender, age, ethnicity, race } = req.body;
    
    // Save the data to a database or file (this is just an example)
    console.log('Received data:', req.body);
  
    // Respond to the client
    res.status(200).json({ message: 'Data received successfully' });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});