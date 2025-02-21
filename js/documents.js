document.addEventListener('DOMContentLoaded', function() {
    const docModel = new DocumentModel();
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const cancelUpload = document.getElementById('cancelUpload');
    const pdfUploadForm = document.getElementById('pdfUploadForm');
    const documentsList = document.getElementById('documentsList');
    const noDocuments = document.getElementById('noDocuments');

    // Show/hide upload form
    uploadBtn.addEventListener('click', function() {
        uploadForm.classList.remove('hidden');
    });

    cancelUpload.addEventListener('click', function() {
        uploadForm.classList.add('hidden');
        pdfUploadForm.reset();
    });

    // Handle form submission
    pdfUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('pdfFile');
        if (!fileInput.files.length) {
            alert('Please select a PDF file to upload');
            return;
        }
        
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file');
            return;
        }
        
        // Create a FileReader to read the file as data URL
        const reader = new FileReader();
        reader.onload = function(event) {
            const document = {
                title: document.getElementById('docTitle').value,
                description: document.getElementById('docDescription').value,
                category: document.getElementById('docCategory').value,
                filename: file.name,
                fileData: event.target.result, // The base64 data URL
                fileSize: file.size
            };
            
            docModel.addDocument(document);
            uploadForm.classList.add('hidden');
            pdfUploadForm.reset();
            loadDocuments();
        };
        
        reader.readAsDataURL(file);
    });

    // Load and display documents
    function loadDocuments() {
        const documents = docModel.getAllDocuments();
        documentsList.innerHTML = '';
        
        if (documents.length === 0) {
            noDocuments.style.display = 'block';
            return;
        }
        
        noDocuments.style.display = 'none';
        
        documents.forEach(doc => {
            const docCard = document.createElement('div');
            docCard.className = 'document-card';
            
            // Format upload date
            const uploadDate = new Date(doc.uploadDate);
            const formattedDate = uploadDate.toLocaleDateString();
            
            // Format file size
            let fileSize = '';
            if (doc.fileSize < 1024) {
                fileSize = doc.fileSize + ' B';
            } else if (doc.fileSize < 1024 * 1024) {
                fileSize = (doc.fileSize / 1024).toFixed(1) + ' KB';
            } else {
                fileSize = (doc.fileSize / (1024 * 1024)).toFixed(1) + ' MB';
            }
            
            docCard.innerHTML = `
                <h3>${doc.title}</h3>
                <p class="doc-description">${doc.description || 'No description provided'}</p>
                <div class="doc-meta">
                    <span>Category: ${doc.category}</span>
                    <span>Size: ${fileSize}</span>
                    <span>Uploaded: ${formattedDate}</span>
                </div>
                <div class="doc-actions">
                    <a href="view-document.html?id=${doc.id}" class="view-btn">View PDF</a>
                    <button class="delete-btn" data-id="${doc.id}">Delete</button>
                </div>
            `;
            
            documentsList.appendChild(docCard);
            
            // Add delete event listener
            const deleteBtn = docCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                const docId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this document?')) {
                    docModel.deleteDocument(docId);
                    loadDocuments();
                }
            });
        });
    }
    
    // Initial load
    loadDocuments();
});