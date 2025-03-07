from flask import Flask, render_template, send_from_directory, abort, url_for
import os

app = Flask(__name__)

# Define the structure of courses by year, branch, and subjects
course_structure = {
    "1": {  # First Year
        "CMPN": ["Engineering Mathematics I", "Physics", "Chemistry", "Basic Electronics", "Programming Fundamentals"],
        "IT": ["Engineering Mathematics I", "Physics", "Chemistry", "Computing Basics", "Introduction to IT"],
        "ECS": ["Engineering Mathematics I", "Physics", "Electronics I", "Computer Fundamentals", "Digital Circuits"],
        "EXTC": ["Engineering Mathematics I", "Physics", "Electronics Basics", "Communication Principles", "Circuit Theory"],
        "ELEC": ["Engineering Mathematics I", "Physics", "Basic Electrical", "Circuit Analysis", "Electrical Measurements"]
    },
    "2": {  # Second Year
        "CMPN": ["Engineering Mathematics II", "Data Structures", "Digital Systems", "Computer Networks", "Object-Oriented Programming"],
        "IT": ["Engineering Mathematics II", "Database Systems", "Web Technologies", "Computer Architecture", "Operating Systems"],
        "ECS": ["Engineering Mathematics II", "Microprocessors", "Computer Organization", "Signals and Systems", "Software Engineering"],
        "EXTC": ["Engineering Mathematics II", "Analog Electronics", "Digital Communication", "Signals and Systems", "Microcontrollers"],
        "ELEC": ["Engineering Mathematics II", "Power Systems", "Control Systems", "Electrical Machines", "Power Electronics"]
    },
    "3": {  # Third Year
        "CMPN": ["Engineering Mathematics III", "Design and Analysis of Algorithms", "Database Management", "Operating Systems", "Software Engineering"],
        "IT": ["Engineering Mathematics III", "Computer Networks", "Information Security", "Mobile Computing", "AI Fundamentals"],
        "ECS": ["Engineering Mathematics III", "Embedded Systems", "VLSI Design", "Communication Networks", "Control Systems"],
        "EXTC": ["Engineering Mathematics III", "RF Engineering", "Wireless Communication", "Antenna Theory", "Digital Signal Processing"],
        "ELEC": ["Engineering Mathematics III", "High Voltage Engineering", "Control Systems II", "Microcontrollers", "Power System Protection"]
    },
    "4": {  # Fourth Year
        "CMPN": ["Engineering Mathematics IV", "Artificial Intelligence", "Machine Learning", "Cloud Computing", "Big Data Analytics"],
        "IT": ["Engineering Mathematics IV", "Data Mining", "IoT Systems", "Blockchain Technology", "Cloud Security"],
        "ECS": ["Engineering Mathematics IV", "Internet of Things", "Robotics", "Machine Vision", "Advanced Microprocessors"],
        "EXTC": ["Engineering Mathematics IV", "Satellite Communication", "Mobile Networks", "Optical Communication", "Microwave Engineering"],
        "ELEC": ["Engineering Mathematics IV", "Smart Grid", "Renewable Energy Systems", "Power Quality", "Industrial Automation"]
    }
}

# Map course to file names
def get_ebook_filename(year, branch, subject):
    # Convert subject name to filename format (lowercase with underscores)
    filename = subject.lower().replace(" ", "_") + ".pdf"
    return filename

def get_ebook_path(year, branch, subject):
    filename = get_ebook_filename(year, branch, subject)
    # Ensure path is properly formatted for the file system
    return os.path.join('static', 'ebooks', year, branch.lower(), filename)

@app.route('/')
def elearning():
    return render_template('E_learning.html', course_structure=course_structure)

@app.route('/year/<year>')
def year_view(year):
    if year in course_structure:
        return render_template('year.html', year=year, branches=course_structure[year].keys())
    return abort(404)

@app.route('/year/<year>/branch/<branch>')
def branch_view(year, branch):
    if year in course_structure and branch in course_structure[year]:
        return render_template('branch.html', year=year, branch=branch, subjects=course_structure[year][branch])
    return abort(404)

@app.route('/display/<year>/<branch>/<subject>')
def display_ebook(year, branch, subject):
    if (year in course_structure and 
        branch in course_structure[year] and 
        subject in course_structure[year][branch]):
        
        # Check if the file exists
        pdf_path = get_ebook_path(year, branch, subject)
        if not os.path.exists(pdf_path):
            return render_template('error.html', message=f"PDF for {subject} is not available")
        
        # This route will display the PDF in the browser
        pdf_url = url_for('get_pdf', year=year, branch=branch, subject=subject)
        return render_template('pdf_viewer.html', pdf_url=pdf_url, subject=subject)
    return abort(404)

@app.route('/get_pdf/<year>/<branch>/<subject>')
def get_pdf(year, branch, subject):
    if (year in course_structure and 
        branch in course_structure[year] and 
        subject in course_structure[year][branch]):
        
        filename = get_ebook_filename(year, branch, subject)
        # Directory path for the PDF file
        directory = os.path.join('static', 'ebooks', year, branch.lower())
        
        # Check if directory exists
        if not os.path.exists(directory):
            return abort(404)
            
        return send_from_directory(directory, filename)
    return abort(404)

@app.route('/download/<year>/<branch>/<subject>')
def download_ebook(year, branch, subject):
    if (year in course_structure and 
        branch in course_structure[year] and 
        subject in course_structure[year][branch]):
        
        filename = get_ebook_filename(year, branch, subject)
        directory = os.path.join('static', 'ebooks', year, branch.lower())
        
        # Check if directory and file exist
        full_path = os.path.join(directory, filename)
        if not os.path.exists(full_path):
            return render_template('error.html', message=f"Download for {subject} is not available")
            
        return send_from_directory(directory, filename, as_attachment=True)
    return abort(404)

# Create a route to check if all PDFs exist
@app.route('/admin/check-pdfs')
def check_pdfs():
    missing_pdfs = []
    for year in course_structure:
        for branch in course_structure[year]:
            for subject in course_structure[year][branch]:
                pdf_path = get_ebook_path(year, branch, subject)
                if not os.path.exists(pdf_path):
                    missing_pdfs.append({
                        'year': year,
                        'branch': branch,
                        'subject': subject,
                        'path': pdf_path
                    })
    
    return render_template('admin_check_pdfs.html', missing_pdfs=missing_pdfs)

if __name__ == '__main__':
    # Ensure the required directories exist
    for year in course_structure:
        for branch in course_structure[year]:
            directory = os.path.join('static', 'ebooks', year, branch.lower())
            os.makedirs(directory, exist_ok=True)
            
    app.run(debug=True)