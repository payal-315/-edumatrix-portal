document.addEventListener('DOMContentLoaded', async function() {
    // --- API Configuration ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000'
        : 'https://edumatrix-bu32.onrender.com';

    const container = document.getElementById('cardContainer');
    const loadingMessage = document.getElementById('loadingMessage');
    const noRecordsMessage = document.getElementById('noRecordsMessage');

    const VTU_SUBJECTS = {
        "1": ["Mathematics-I", "Applied Physics", "Programming in C", "Engineering Science", "English", "Physics Lab", "C Programming Lab", "Environmental Studies"],
        "2": ["Mathematics-II", "Applied Chemistry", "Computer Aided Drawing", "Basic Electronics", "Basic Electrical", "Chemistry Lab", "Electrical Lab", "Constitution of India"],
        "3": ["Transform Calculus", "Data Structures", "Computer Organization", "Object Oriented Prog", "Digital Design", "Data Structures Lab", "Digital Design Lab", "Social Connect & Responsibility"],
        "4": ["Maths - Probability", "Analysis of Algorithms", "Operating Systems", "Microcontrollers", "Discrete Math", "DAA Lab", "Microcontroller Lab", "Biology for Engineers", "Universal Human Values"],
        "5": ["Software Engineering", "Computer Networks", "Database Management", "Theory of Computation", "Unix Programming", "Computer Networks Lab", "DBMS Lab", "Research Methodology"],
        "6": ["Compiler Design", "Artificial Intelligence", "Cyber Security", "Cloud Computing", "Software Testing", "AI & ML Lab", "Mini Project", "Open Elective"],
        "7": ["Machine Learning", "Big Data Analytics", "IoT", "Information Security", "ML Lab", "Big Data Lab", "Project Phase-1", "Internship"],
        "8": ["Professional Practice", "Seminar", "Major Project"]
    };

    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
        container.innerHTML = "<p>Please log in to view academic records.</p>";
        return;
    }

    async function fetchAndDisplayRecords() {
        loadingMessage.style.display = 'block';
        noRecordsMessage.style.display = 'none';
        container.innerHTML = ''; 

        try {
            const response = await fetch(`${API_BASE_URL}/api/academic-info/${userId}`);
            const result = await response.json();

            loadingMessage.style.display = 'none';

            if (response.ok && result.academicInfo && result.academicInfo.length > 0) {
                result.academicInfo.sort((a, b) => a.semester - b.semester);

                result.academicInfo.forEach(record => {
                    const card = document.createElement('div');
                    card.className = 'academic-card';
                    card.setAttribute('data-record-id', record.id);
                    card.setAttribute('data-semester', record.semester);

                    let attendancePercentage = 'N/A';
                    if (record.total_classes > 0) {
                        attendancePercentage = ((record.attended_classes / record.total_classes) * 100).toFixed(2) + '%';
                    } else if (record.attendance !== null && record.attendance !== undefined) {
                        attendancePercentage = parseFloat(record.attendance).toFixed(2) + '%';
                    }

                    const subjects = VTU_SUBJECTS[record.semester] || [];
                    let dynamicMarksHTML = '';
                    
                    subjects.forEach((subjectName, index) => {
                        const markVal = record[`sub${index + 1}`] ?? 'N/A';
                        dynamicMarksHTML += `<div><strong>${subjectName}:</strong> ${markVal}</div>`;
                    });

                    card.innerHTML = `
                        <h2>${record.name || 'N/A'} (Sem ${record.semester})</h2>
                        <p><strong>USN:</strong> ${record.usn || 'N/A'} | <strong>Dept:</strong> ${record.department || 'N/A'}</p>
                        
                        <div class="marks-grid">
                            ${dynamicMarksHTML}
                        </div>

                        <div class="stats-footer">
                           <p><strong>SGPA:</strong> ${record.sgpa ?? 'N/A'} | <strong>CGPA:</strong> ${record.cgpa ?? 'N/A'}</p>
                           <p><strong>Attendance:</strong> ${record.attended_classes ?? 'N/A'}/${record.total_classes ?? 'N/A'} (${attendancePercentage})</p>
                        </div>
                        
                        <p class="remarks"><strong>Remarks:</strong> ${record.remarks || 'N/A'}</p>
                        
                        <div class="menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    `;

                    container.appendChild(card);

                    const menu = card.querySelector('.menu');
                    menu.addEventListener('click', function(event) {
                        event.stopPropagation();
                        showDeleteModal(record.id, record.name, record.semester);
                    });
                });
            } else {
                noRecordsMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching academic records:', error);
            loadingMessage.style.display = 'none';
            noRecordsMessage.textContent = 'An error occurred while loading records.';
            noRecordsMessage.style.display = 'block';
        }
    }

    async function showDeleteModal(recordId, recordName, semester) {
        const modal = document.createElement('div');
        modal.classList.add('delete-modal');
        modal.innerHTML = `
            <div class="modal-content">
                <p>Are you sure you want to delete the record for <strong>${recordName}</strong> (Semester ${semester})?</p>
                <button id="confirm-delete">Delete</button>
                <button class="cancel-btn" id="cancel-delete">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = "flex";

        modal.querySelector("#confirm-delete").addEventListener("click", async function () {
            try {
                const response = await fetch(`${API_BASE_URL}/api/academic-info/${recordId}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Record deleted successfully!');
                    modal.remove();
                    fetchAndDisplayRecords();
                } else {
                    alert('Failed to delete record.');
                }
            } catch (error) { console.error(error); }
        });

        modal.querySelector("#cancel-delete").addEventListener("click", () => modal.remove());
    }

    fetchAndDisplayRecords();
});
