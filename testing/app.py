from flask import Flask, render_template, send_from_directory, abort, url_for

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
    return f"{year}_{branch.lower()}_{filename}"

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
        
        filename = get_ebook_filename(year, branch, subject)
        # This route will display the PDF in the browser
        return render_template('pdf_viewer.html', pdf_url=url_for('get_pdf', year=year, branch=branch, subject=subject))
    return abort(404)

@app.route('/get_pdf/<year>/<branch>/<subject>')
def get_pdf(year, branch, subject):
    if (year in course_structure and 
        branch in course_structure[year] and 
        subject in course_structure[year][branch]):
        
        filename = get_ebook_filename(year, branch, subject)
        # Path would be like static/ebooks/1_cmpn_engineering_mathematics_i.pdf
        pdf_path = f"{year}/{branch.lower()}"
        return send_from_directory(f'static/ebooks/{pdf_path}', filename)
    return abort(404)

@app.route('/download/<year>/<branch>/<subject>')
def download_ebook(year, branch, subject):
    if (year in course_structure and 
        branch in course_structure[year] and 
        subject in course_structure[year][branch]):
        
        filename = get_ebook_filename(year, branch, subject)
        pdf_path = f"{year}/{branch.lower()}"
        return send_from_directory(f'static/ebooks/{pdf_path}', filename, as_attachment=True)
    return abort(404)

if __name__ == '__main__':
    app.run(debug=True)