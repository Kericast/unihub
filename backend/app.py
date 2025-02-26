from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

# Route to render the HTML page
@app.route('/')
def elearning():
    return render_template('E_learning.html')

# Route to handle e-book downloads
@app.route('/download/<subject>')
def download_ebook(subject):
    ebook_files = {
        "mathematics-iv": "mathematics_iv.pdf",
        "microprocessor": "microprocessor.pdf",
        "aoa": "aoa.pdf",
        "dbms": "dbms.pdf",
        "operating-sys": "operating_system.pdf",
        "python": "python.pdf",
    }
    
    if subject in ebook_files:
        return send_from_directory('static/ebooks', ebook_files[subject], as_attachment=True)
    else:
        return "E-Book not found", 404

if __name__ == '__main__':
    app.run(debug=True)
