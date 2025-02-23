document.addEventListener('DOMContentLoaded', function() {
    // Set worker path for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
    
    const docModel = new DocumentModel();
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    
    if (!docId) {
        window.location.href = 'documents.html';
        return;
    }
    
    const document = docModel.getDocument(docId);
    if (!document) {
        alert('Document not found');
        window.location.href = 'documents.html';
        return;
    }
    
    // Display document info
    const docInfoElement = document.getElementById('documentInfo');
    docInfoElement.innerHTML = `
        <h1>${document.title}</h1>
        <p>${document.description || 'No description provided'}</p>
        <p>Category: ${document.category}</p>
        <p>Filename: ${document.filename}</p>
    `;
    
    // PDF viewer variables
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    const canvas = document.getElementById('pdfViewer');
    const ctx = canvas.getContext('2d');
    
    // Load PDF from base64 data URL
    pdfjsLib.getDocument(document.fileData).promise.then(function(pdf) {
        pdfDoc = pdf;
        document.getElementById('pageInfo').textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
        renderPage(pageNum);
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
        alert('Failed to load the PDF document.');
    });
    
    // Render specific page
    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            page.render(renderContext).promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        
        document.getElementById('pageInfo').textContent = `Page ${num} of ${pdfDoc.numPages}`;
    }
    
    // Handle page navigation
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    
    document.getElementById('prevPage').addEventListener('click', function() {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    });
});