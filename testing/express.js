// server.js or your Express app file
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Configure storage for uploaded PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instance
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document metadata storage (in a real app, use a database)
let documents = [];

// API endpoints for documents
app.get('/api/documents', (req, res) => {
  res.json(documents);
});

app.get('/api/documents/:id', (req, res) => {
  const id = req.params.id;
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).send('Document not found');
  }
  
  const filePath = path.join(__dirname, 'uploads/documents', document.filename);
  res.sendFile(filePath);
});

app.post('/api/documents', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No PDF file uploaded');
    }
    
    const newDoc = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      filename: req.file.filename,
      uploadDate: new Date(),
      category: req.body.category || 'Uncategorized'
    };
    
    documents.push(newDoc);
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: newDoc
    });
  } catch (error) {
    res.status(500).send(`Error uploading document: ${error.message}`);
  }
});

// Admin route to delete a document
app.delete('/api/documents/:id', (req, res) => {
  const id = req.params.id;
  const docIndex = documents.findIndex(doc => doc.id === id);
  
  if (docIndex === -1) {
    return res.status(404).send('Document not found');
  }
  
  const document = documents[docIndex];
  const filePath = path.join(__dirname, 'uploads/documents', document.filename);
  
  // Delete the file
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).send(`Error deleting file: ${err.message}`);
    }
    
    // Remove from documents array
    documents.splice(docIndex, 1);
    
    res.json({ message: 'Document deleted successfully' });
  });
});

// Other server configuration...