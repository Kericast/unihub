// main.js or your entry point file
import PDFManager from './PDFManager.js';

// Initialize the PDF functionality when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load the PDF.js library
  const pdfJsScript = document.createElement('script');
  pdfJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
  document.head.appendChild(pdfJsScript);

  pdfJsScript.onload = () => {
    // Set the worker source
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    
    // Initialize PDF functionality
    initializePDFFeatures();
  };
});

function initializePDFFeatures() {
  // Fetch and display the list of PDFs
  PDFManager.fetchPDFList().then(() => {
    PDFManager.renderPDFList('pdf-documents-container');
  });
  
  // Set up close button for PDF viewer
  const closeBtn = document.getElementById('close-pdf-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      PDFManager.closePDFViewer();
    });
  }
  
  // Add upload functionality if needed
  setupUploadForm();
}

function setupUploadForm() {
  const uploadForm = document.getElementById('pdf-upload-form');
  if (!uploadForm) return;
  
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(uploadForm);
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      alert('Document uploaded successfully!');
      
      // Refresh the PDF list
      PDFManager.fetchPDFList().then(() => {
        PDFManager.renderPDFList('pdf-documents-container');
      });
      
      // Reset form
      uploadForm.reset();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  });
}