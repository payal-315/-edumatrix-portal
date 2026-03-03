document.addEventListener('DOMContentLoaded', async function () {
    // --- API Configuration ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://edumatrix-bu32.onrender.com';

    // --- 1. VTU Subject Mapping ---
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

    // Helper to update all 9 labels and hide extra ones
    function updateDynamicLabels(semester) {
        const subjects = VTU_SUBJECTS[semester] || [];
        for (let i = 1; i <= 9; i++) {
            const label = document.getElementById(`label_sub${i}`);
            if (label) {
                const input = label.querySelector('input');
                if (subjects[i - 1]) {
                    label.style.display = 'block';
                    label.firstChild.textContent = subjects[i - 1] + ": ";
                    input.required = true;
                } else {
                    label.style.display = 'none';
                    input.required = false;
                    input.value = "";
                }
            }
        }
    }

    let currentSection = 1; 
    const academicForm = document.getElementById('academicForm');
    const semesterSelect = document.getElementById('semesterSelect');
    const submitAcademicBtn = document.getElementById('submitAcademicBtn');
    const formMessage = document.getElementById('formMessage');

    const usnInput = academicForm.querySelector('[name="usn"]');
    const nameInput = academicForm.querySelector('[name="name"]');
    const departmentInput = academicForm.querySelector('[name="department"]');

    let allAcademicData = {}; 

    function showMessage(message, isError = false) {
        formMessage.textContent = message;
        formMessage.className = 'message'; 
        if (isError) formMessage.classList.add('error');
        formMessage.style.display = 'block';
        setTimeout(() => { formMessage.style.display = 'none'; }, 5000);
    }

    function prefillForm(data) {
        academicForm.querySelectorAll('input, textarea').forEach(input => {
            if (!['usn', 'name', 'department', 'semester'].includes(input.name)) {
                input.value = '';
            }
        });

        if (!data) {
            submitAcademicBtn.textContent = 'Submit Academic Info';
            return;
        }

        updateDynamicLabels(data.semester);

        const setInputValue = (name, value) => {
            const input = academicForm.querySelector(`[name="${name}"]`);
            if (input && value !== null && value !== undefined) {
                input.value = value;
            }
        };

        for (let i = 1; i <= 9; i++) {
            setInputValue(`sub${i}`, data[`sub${i}`]);
        }
        
        setInputValue('sgpa', data.sgpa);
        setInputValue('cgpa', data.cgpa);
        setInputValue('total_classes', data.total_classes);
        setInputValue('attended_classes', data.attended_classes);
        setInputValue('attendance_percent', data.attendance);
        setInputValue('remarks', data.remarks);

        submitAcademicBtn.textContent = 'Update Academic Info';
    }

    const userId = sessionStorage.getItem('user_id');
    const usernameFromSession = sessionStorage.getItem('username');

    if (!userId) {
        showMessage('User not logged in. Please log in.', true);
        return;
    }

    async function fetchAcademicInfoAndPrefill() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/academic-info/${userId}`);
            const result = await response.json();
            allAcademicData = {}; 

            if (response.ok && result.academicInfo && result.academicInfo.length > 0) {
                result.academicInfo.forEach(entry => { allAcademicData[entry.semester] = entry; });

                const firstRecord = result.academicInfo[0];
                if (usnInput) { usnInput.value = firstRecord.usn || ''; usnInput.readOnly = true; }
                if (nameInput) { nameInput.value = firstRecord.name || ''; nameInput.readOnly = true; }
                if (departmentInput) { departmentInput.value = firstRecord.department || ''; departmentInput.readOnly = true; }

                if (semesterSelect.value) {
                    updateDynamicLabels(semesterSelect.value);
                    prefillForm(allAcademicData[semesterSelect.value]);
                }
            } else if (response.status === 404) {
                if (nameInput && !nameInput.value && usernameFromSession) nameInput.value = usernameFromSession;
            }
        } catch (error) { console.error('Fetch error:', error); }
    }

    fetchAcademicInfoAndPrefill();

    semesterSelect.addEventListener('change', () => {
        const selectedSemester = semesterSelect.value;
        if (selectedSemester) {
            updateDynamicLabels(selectedSemester);
            prefillForm(allAcademicData[selectedSemester]);
            showMessage(`Form updated for Semester ${selectedSemester}.`, false);
        } else {
            prefillForm(null);
        }
        academicForm.querySelectorAll('.form-section').forEach((section, index) => {
            section.style.display = (index === 0) ? 'block' : 'none';
        });
        currentSection = 1;
    });

    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', function () {
            const currentFieldset = button.closest('fieldset');
            if (!validateSection(currentFieldset)) {
                showMessage('Please fill in all required fields.', true);
                return;
            }
            currentFieldset.style.display = 'none';
            currentSection++;
            const nextSection = document.getElementById(`section${currentSection}`);
            if (nextSection) nextSection.style.display = 'block';
        });
    });

    document.querySelectorAll('.back-btn').forEach(button => {
        button.addEventListener('click', function () {
            const currentFieldset = button.closest('fieldset');
            currentFieldset.style.display = 'none';
            currentSection--;
            const prevSection = document.getElementById(`section${currentSection}`);
            if (prevSection) prevSection.style.display = 'block';
        });
    });

    academicForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const lastSection = document.getElementById(`section${currentSection}`);
        if (!validateSection(lastSection)) return;

        const formData = new FormData(this);
        const academicData = {};
        
        formData.forEach((value, key) => { 
            if (['usn', 'name', 'department', 'remarks'].includes(key)) {
                academicData[key] = value;
            } else {
                academicData[key] = value === "" ? 0 : parseFloat(value);
            }
        });

        academicData.user_id = userId;

        try {
            const response = await fetch(`${API_BASE_URL}/api/academic-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(academicData),
            });
            const result = await response.json();
            if (response.ok) {
                showMessage('Academic records saved successfully!', false);
                setTimeout(() => { window.location.href = 'academic-cards.html'; }, 1000);
            } else {
                showMessage(result.message || 'Error saving records.', true);
            }
        } catch (error) { console.error('Submission error:', error); }
    });

    function validateSection(section) {
        let isValid = true;
        const inputs = section.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            if (input.readOnly && input.value.trim()) return;
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });
        return isValid;
    }
});
