
    const yearSelect = document.getElementById('year');
    const branchSelect = document.getElementById('branch');
    const subjectSelect = document.getElementById('subject');
    const ebooksCheckbox = document.getElementById('ebooks');
    const pyqsCheckbox = document.getElementById('pyqs');
    const pdfViewer = document.getElementById('pdfViewer');

    // Enable "Next" button only when a valid selection is made
    yearSelect.addEventListener('change', () => {
        document.getElementById('nextToBranch').disabled = !yearSelect.value;
    });

    branchSelect.addEventListener('change', () => {
        document.getElementById('nextToSubject').disabled = !branchSelect.value;
    });

    subjectSelect.addEventListener('change', () => {
        document.getElementById('nextToResources').disabled = !subjectSelect.value;
    });

    // Step navigation function
    function goToStep(step) {
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}`).classList.toggle('hidden', i !== step);
        }
    }

    // Display selected resources
    function showResources() {
        if (ebooksCheckbox.checked) {
            pdfViewer.src = "path/to/ebooks.pdf"; // Replace with actual Ebooks PDF URL
        } else if (pyqsCheckbox.checked) {
            pdfViewer.src = "path/to/pyqs.pdf"; // Replace with actual PYQs PDF URL
        } else {
            pdfViewer.src = "";
        }
    }

