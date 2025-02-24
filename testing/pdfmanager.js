// PDFManager.js
class PDFManager {
    constructor() {
      this.pdfList = [];
      this.apiEndpoint = '/api/documents'; // Adjust based on your backend
    }
  
    async fetchPDFList() {
      try {
        const response = await fetch(this.apiEndpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF list');
        }
        this.pdfList = await response.json();
        return this.pdfList;
      } catch (error) {
        console.error('Error fetching PDF list:', error);
        return [];
      }
    }
  
    async fetchPDFById(id) {
      try {
        const response = await fetch(`${this.apiEndpoint}/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        return null;
      }
    }
  
    renderPDFList(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
  
      container.innerHTML = '';
      
      if (this.pdfList.length === 0) {
        container.innerHTML = '<p>No PDFs available</p>';
        return;
      }
  
      const list = document.createElement('div');
      list.className = 'pdf-list';
  
      this.pdfList.forEach(pdf => {
        const item = document.createElement('div');
        item.className = 'pdf-item';
        
        const title = document.createElement('h3');
        title.textContent = pdf.title;
        
        const description = document.createElement('p');
        description.textContent = pdf.description || 'No description available';
        
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View PDF';
        viewButton.onclick = () => this.openPDF(pdf.id);
        
        item.appendChild(title);
        item.appendChild(description);
        item.appendChild(viewButton);
        list.appendChild(item);
      });
  
      container.appendChild(list);
    }
  
    async openPDF(id) {
      const pdfUrl = await this.fetchPDFById(id);
      if (!pdfUrl) {
        alert('Failed to load PDF');
        return;
      }
  
      // Open PDF viewer
      const viewerContainer = document.getElementById('pdf-viewer-container');
      if (!viewerContainer) return;
  
      viewerContainer.style.display = 'block';
      
      const viewer = document.getElementById('pdf-viewer');
      if (!viewer) return;
      
      // If using PDF.js
      pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc => {
        const viewer = document.getElementById('pdf-viewer');
        this.renderPDF(pdfDoc, viewer);
      }).catch(error => {
        console.error('Error rendering PDF:', error);
        alert('Failed to render PDF');
      });
    }
  
    async renderPDF(pdfDoc, container) {
      container.innerHTML = '';
      
      // Get total pages
      const numPages = pdfDoc.numPages;
      
      // Create page navigation
      const navigation = document.createElement('div');
      navigation.className = 'pdf-navigation';
      
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Previous';
      prevBtn.disabled = true;
      
      const pageInfo = document.createElement('span');
      pageInfo.textContent = `Page 1 of ${numPages}`;
      
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.disabled = numPages <= 1;
      
      navigation.appendChild(prevBtn);
      navigation.appendChild(pageInfo);
      navigation.appendChild(nextBtn);
      
      container.appendChild(navigation);
      
      // Create canvas for PDF rendering
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      
      let currentPage = 1;
      const renderPage = async (pageNum) => {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Update navigation
        pageInfo.textContent = `Page ${pageNum} of ${numPages}`;
        prevBtn.disabled = pageNum <= 1;
        nextBtn.disabled = pageNum >= numPages;
        
        currentPage = pageNum;
      };
      
      // Set up navigation handlers
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          renderPage(currentPage - 1);
        }
      };
      
      nextBtn.onclick = () => {
        if (currentPage < numPages) {
          renderPage(currentPage + 1);
        }
      };
      
      // Render first page
      renderPage(1);
    }
  
    closePDFViewer() {
      const viewerContainer = document.getElementById('pdf-viewer-container');
      if (viewerContainer) {
        viewerContainer.style.display = 'none';
      }
    }
  }
  
  // Export the manager
  export default new PDFManager();