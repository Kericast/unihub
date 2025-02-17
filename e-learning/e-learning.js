document.addEventListener('DOMContentLoaded', function() {
    const domainSelect = document.getElementById('domain-select');
    const subjectSelect = document.getElementById('subject-select');
    const yearSelect = document.getElementById('year-select');
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const resultsContainer = document.getElementById('results-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    let currentPage = 1;
    
    // Load initial data
    loadDomains();
    loadYears();
    loadDocuments();
    
    // Event listeners
    domainSelect.addEventListener('change', function() {
        loadSubjects(this.value);
        loadDocuments();
    });
    
    subjectSelect.addEventListener('change', loadDocuments);
    yearSelect.addEventListener('change', loadDocuments);
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        currentPage = 1;
        loadDocuments();
    });
    
    // Functions to load data from API
    function loadDomains() {
        fetch('/api/domains')
            .then(response => response.json())
            .then(domains => {
                domainSelect.innerHTML = '<option value="">All Domains</option>';
                domains.forEach(domain => {
                    const option = document.createElement('option');
                    option.value = domain.domain_id;
                    option.textContent = domain.domain_name;
                    domainSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading domains:', error));
    }
    
    function loadSubjects(domainId) {
        let url = '/api/subjects';
        if (domainId) {
            url += `?domain_id=${domainId}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(subjects => {
                subjectSelect.innerHTML = '<option value="">All Subjects</option>';
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.subject_id;
                    option.textContent = subject.subject_name;
                    subjectSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading subjects:', error));
    }
    
    function loadYears() {
        fetch('/api/years')
            .then(response => response.json())
            .then(years => {
                yearSelect.innerHTML = '<option value="">All Years</option>';
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year.year_id;
                    option.textContent = year.year_name;
                    yearSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading years:', error));
    }
    
    function loadDocuments() {
        const domainId = domainSelect.value;
        const subjectId = subjectSelect.value;
        const yearId = yearSelect.value;
        const searchTerm = searchInput.value.trim();
        
        let url = `/api/documents?page=${currentPage}`;
        if (domainId) url += `&domain_id=${domainId}`;
        if (subjectId) url += `&subject_id=${subjectId}`;
        if (yearId) url += `&year_id=${yearId}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayDocuments(data.documents);
                displayPagination(data.pagination);
            })
            .catch(error => console.error('Error loading documents:', error));
    }
    
    function displayDocuments(documents) {
        if (documents.length === 0) {
            resultsContainer.innerHTML = '<p>No documents found matching your criteria.</p>';
            return;
        }
        
        resultsContainer.innerHTML = '';
        documents.forEach(doc => {
            const docCard = document.createElement('div');
            docCard.className = 'document-card';
            
            docCard.innerHTML = `
                <h3 class="document-title">${doc.title}</h3>
                <div class="document-meta">
                    <p>Subject: ${doc.subject_name || 'N/A'}</p>
                    <p>Year: ${doc.year_name || 'N/A'}</p>
                    <p>Uploaded: ${new Date(doc.upload_date).toLocaleDateString()}</p>
                </div>
                <div class="document-actions">
                    <a href="view-document.html?id=${doc.document_id}" class="btn">View</a>
                    <a href="${doc.file_path}" download class="btn btn-secondary">Download</a>
                </div>
            `;
            
            resultsContainer.appendChild(docCard);
        });
    }
    
    function displayPagination(pagination) {
        const { total, page, limit, pages } = pagination;
        
        if (pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        if (page > 1) {
            paginationHTML += `<li><a href="#" data-page="${page - 1}">&laquo; Previous</a></li>`;
        }
        
        // Page numbers
        for (let i = 1; i <= pages; i++) {
            if (i === page) {
                paginationHTML += `<li><a href="#" class="active" data-page="${i}">${i}</a></li>`;
            } else if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
                paginationHTML += `<li><a href="#" data-page="${i}">${i}</a></li>`;
            } else if (i === page - 3 || i === page + 3) {
                paginationHTML += '<li>...</li>';
            }
        }
        
        // Next button
        if (page < pages) {
            paginationHTML += `<li><a href="#" data-page="${page + 1}">Next &raquo;</a></li>`;
        }
        
        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination links
        const paginationLinks = paginationContainer.querySelectorAll('a[data-page]');
        paginationLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = parseInt(this.dataset.page);
                loadDocuments();
                window.scrollTo(0, 0);
            });
        });
    }
}); 