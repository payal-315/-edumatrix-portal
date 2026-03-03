document.addEventListener('DOMContentLoaded', async () => {
    console.log('personal.js: DOM Content Loaded. Initializing...');
    const personalForm = document.getElementById('personalForm');
    const fieldsets = personalForm.querySelectorAll('fieldset');
    const progressTracker = document.getElementById('progressTracker');
    const displayInfoSection = document.getElementById('displayInfo'); // Corrected variable name from displayInfo
    const infoContent = document.getElementById('infoContent');
    const editButton = document.getElementById('editButton');

    let currentStep = 0;
    const totalSteps = fieldsets.length;

    // --- IMPORTANT: Get userId from sessionStorage ---
    const userId = sessionStorage.getItem('user_id');
    console.log('personal.js: Retrieved user_id from sessionStorage:', userId);

    // If no userId, disable form interaction and prompt login
    if (!userId) {
        alert('User not logged in. Please log in to manage personal information.');
        personalForm.style.display = 'none'; // Hide form
        displayInfoSection.innerHTML = '<p style="text-align: center; color: #d9534f;">Please log in to view or add personal information.</p>';
        displayInfoSection.style.display = 'block'; // Show message
        progressTracker.style.display = 'none'; // Hide progress
        editButton.style.display = 'none'; // Hide edit button
        return; // Stop execution
    }
    // --- Helper Functions ---
    function updateProgress() {
        progressTracker.textContent = `Step ${currentStep + 1}/${totalSteps}`;
    }
    function showStep(stepIndex) {
        fieldsets.forEach((fieldset, index) => {
            fieldset.classList.toggle('active', index === stepIndex);
            fieldset.style.display = (index === stepIndex) ? 'block' : 'none';
        });
        currentStep = stepIndex;
        updateProgress();
        console.log(`personal.js: Showing step: ${stepIndex + 1}`);
    }
    function validateStep(index) {
        console.log(`personal.js: --- Validating step: ${index + 1} ---`);
        const inputs = fieldsets[index].querySelectorAll('input:not([type="button"]), select, textarea'); // Exclude buttons
        let allValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                allValid = false;
                console.log(`personal.js: Validation FAILED for input: ${input.name}`);
            }
        });
        if (allValid) {
            console.log(`personal.js: --- Step ${index + 1} is VALID ---`);
        }
        return allValid;
    }
    // Function to populate the form with fetched data
    function populateForm(data) {
        console.log('personal.js: Populating form with data:', data);
        for (const key in data) {
            const input = personalForm.elements[key]; // Use form.elements for direct access by name
            if (input) {
                if (input.type === 'date' && data[key]) {
                    // Convert ISO string to 'YYYY-MM-DD' for date input
                    input.value = new Date(data[key]).toISOString().split('T')[0];
                } else if (input.type === 'radio' || input.type === 'checkbox') {
                    // Handle radio/checkbox if needed (your current form doesn't use these for pre-filling)
                    // For selects, value will match if option exists
                    input.value = data[key];
                } else {
                    input.value = data[key];
                }
            } else {
                // Handle cases where backend key might not match frontend input name exactly (e.g., snake_case vs camelCase)
                // Example: Backend 'full_name' -> Frontend 'fullName'
                if (key === 'full_name') personalForm.elements.fullName.value = data[key];
                if (key === 'dob') personalForm.elements.dob.value = data[key] ? new Date(data[key]).toISOString().split('T')[0] : '';
                if (key === 'blood_group') personalForm.elements.bloodGroup.value = data[key];
                // Add more mappings here if needed
                if (key === 'alt_phone') personalForm.elements.altPhone.value = data[key];
                if (key === 'father_name') personalForm.elements.fatherName.value = data[key];
                if (key === 'father_phone') personalForm.elements.fatherPhone.value = data[key];
                if (key === 'father_alt_phone') personalForm.elements.fatherAltPhone.value = data[key];
                if (key === 'mother_name') personalForm.elements.motherName.value = data[key];
                if (key === 'mother_phone') personalForm.elements.motherPhone.value = data[key];
                if (key === 'mother_alt_phone') personalForm.elements.motherAltPhone.value = data[key];
                if (key === 'guardian_name') personalForm.elements.guardianName.value = data[key];
                if (key === 'guardian_relation') personalForm.elements.relation.value = data[key]; // Mapping guardian_relation to 'relation'
                if (key === 'guardian_phone') personalForm.elements.guardianPhone.value = data[key];
            }
        }
        // Change submit button text to 'Update'
        const submitBtn = personalForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Personal Info';
        }
    }

    // Function to display fetched data in the summary view
    function displaySummary(data) {
        console.log('personal.js: Displaying info in summary view:', data);
        // Inside displaySummary(data)
        const dobFormatted = data.dob ? new Date(data.dob).toLocaleDateString() : 'N/A';
        // Ensure keys match exactly what your backend returns
        // Assuming your backend returns 'full_name', 'dob', 'blood_group' etc.
        let html = `
            <div class="summary-card">
                <h3>Basic Details</h3>
                <p><strong>Full Name:</strong> ${data.full_name || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${dobFormatted}</p>
                <p><strong>Gender:</strong> ${data.gender || 'N/A'}</p>
                <p><strong>Blood Group:</strong> ${data.blood_group || 'N/A'}</p>
            </div>
            <div class="summary-card">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>Alternate Phone:</strong> ${data.alt_phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${data.address || 'N/A'}, ${data.city || 'N/A'}, ${data.state || 'N/A'} - ${data.zip || 'N/A'}</p>
            </div>
            <div class="summary-card">
                <h3>Parents' Details</h3>
                <p><strong>Father's Name:</strong> ${data.father_name || 'N/A'}</p>
                <p><strong>Father's Mobile:</strong> ${data.father_phone || 'N/A'}</p>
                <p><strong>Father's Alternate Mobile:</strong> ${data.father_alt_phone || 'N/A'}</p>
                <p><strong>Mother's Name:</strong> ${data.mother_name || 'N/A'}</p>
                <p><strong>Mother's Mobile:</strong> ${data.mother_phone || 'N/A'}</p>
                <p><strong>Mother's Alternate Mobile:</strong> ${data.mother_alt_phone || 'N/A'}</p>
            </div>
            <div class="summary-card">
                <h3>Additional Info</h3>
                <p><strong>Nationality:</strong> ${data.nationality || 'N/A'}</p>
                <p><strong>Aadhar Number:</strong> ${data.aadhar || 'N/A'}</p>
            </div>
            <div class="summary-card">
                <h3>Guardian / Emergency Contact</h3>
                <p><strong>Guardian Name:</strong> ${data.guardian_name || 'N/A'}</p>
                <p><strong>Relation:</strong> ${data.guardian_relation || 'N/A'}</p>
                <p><strong>Guardian Phone:</strong> ${data.guardian_phone || 'N/A'}</p>
            </div>
        `;
        infoContent.innerHTML = html;
        personalForm.style.display = 'none';
        displayInfoSection.style.display = 'block';
        progressTracker.style.display = 'none'; // Hide progress tracker in summary view
    }
    // --- Initial Load: Fetch data from backend ---
    async function loadPersonalData() {
        console.log('personal.js: Attempting to load personal data from backend...');
        try {
            const response = await fetch(`http://localhost:3000/api/personal-info/${userId}`); // Updated endpoint path
            console.log('personal.js: Initial fetch API response status:', response.status);
            if (response.ok) {
                const result = await response.json(); // Backend might wrap in { personalInfo: data }
                const data = result.personalInfo || result; // Adjust based on actual backend response structure
                console.log('personal.js: Personal data fetched:', data);
                displaySummary(data); // Show summary if data exists
            } else if (response.status === 404) {
                console.log('personal.js: No personal data found for this user (404). Displaying form.');
                personalForm.reset(); // Clear any old data in form
                showStep(0); // Show form if no data
                personalForm.style.display = 'block';
                displayInfoSection.style.display = 'none';
                progressTracker.style.display = 'block';
            } else {
                const errorData = await response.json();
                console.error('personal.js: Error fetching personal data:', errorData);
                alert(`Error loading data: ${errorData.message || response.statusText}. Please try again.`);
                // Default to showing form on other errors
                personalForm.reset();
                showStep(0);
                personalForm.style.display = 'block';
                displayInfoSection.style.display = 'none';
                progressTracker.style.display = 'block';
            }
        } catch (error) {
            console.error('personal.js: Network error during initial data fetch:', error);
            alert('Could not connect to server to fetch personal data. Please check your network.');
            // Default to showing form on network errors
            personalForm.reset();
            showStep(0);
            personalForm.style.display = 'block';
            displayInfoSection.style.display = 'none';
            progressTracker.style.display = 'block';
        }
    }
    // Call loadPersonalData on page load
    loadPersonalData();
    // --- Navigation (Next/Back buttons) ---
    personalForm.addEventListener('click', (event) => {
        if (event.target.classList.contains('next-btn')) {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps - 1) {
                    showStep(currentStep + 1);
                }
            }
        } else if (event.target.classList.contains('back-btn')) {
            if (currentStep > 0) {
                showStep(currentStep - 1);
            }
        }
    });
    // --- Form Submission (Save/Update) ---
    personalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('personal.js: Form submission initiated.');
        if (!validateStep(currentStep)) {
            console.log('personal.js: Validation failed on final step. Stopping submission.');
            return;
        }
        const formData = new FormData(personalForm);
        const dataObj = {};
        for (const [key, value] of formData.entries()) {
            dataObj[key] = value.trim();
        }
        // Map frontend field names to backend (e.g., camelCase to snake_case)
        // personal.js (submitData preparation)
// personal.js (inside the submit event listener)

// ... (your existing code to get dataObj) ...

const submitData = {
    user_id: userId,
    // Corrected mappings: Use the snake_case names from your HTML 'name' attributes
    full_name: dataObj.full_name, // Corrected: was dataObj.fullName
    dob: dataObj.dob,
    gender: dataObj.gender,
    blood_group: dataObj.blood_group, // Corrected: was dataObj.bloodGroup
    email: dataObj.email,
    phone: dataObj.phone,
    alt_phone: dataObj.alt_phone || null, // Corrected: was dataObj.altPhone
    address: dataObj.address,
    city: dataObj.city,
    state: dataObj.state,
    zip: dataObj.zip,
    father_name: dataObj.father_name, // Corrected: was dataObj.fatherName
    father_phone: dataObj.father_phone, // Corrected: was dataObj.fatherPhone
    father_alt_phone: dataObj.father_alt_phone || null, // Corrected: was dataObj.fatherAltPhone
    mother_name: dataObj.mother_name, // Corrected: was dataObj.motherName
    mother_phone: dataObj.mother_phone, // Corrected: was dataObj.motherPhone
    mother_alt_phone: dataObj.mother_alt_phone || null, // Corrected: was dataObj.motherAltPhone
    nationality: dataObj.nationality,
    aadhar: dataObj.aadhar,
    guardian_name: dataObj.guardian_name, // Corrected: was dataObj.guardianName
    guardian_relation: dataObj.relation, // Corrected: guardian_relation is from backend, you use 'relation' in HTML
    guardian_phone: dataObj.guardian_phone, // Corrected: was dataObj.guardianPhone
};

console.log('personal.js: Data object prepared for submission:', submitData);

// ... rest of your fetch logic ...
// ... (your existing code to prepare submitData) ...

try {
    // Send a PUT request to the specific user's personal info endpoint
    const response = await fetch(`http://localhost:3000/api/personal-info/${userId}`, { // <--- Send userId in the URL for PUT
        method: 'PUT', // <--- IMPORTANT: Use PUT method
        headers: {
            'Content-Type': 'application/json',
            // Add authorization header if you have one
        },
        body: JSON.stringify(submitData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
    }
    const result = await response.json();
    console.log('personal.js: Server response after save/update:', result);
    alert('Personal information saved successfully!');
    displaySummary(result.personalInfo || result); // Adjust based on backend returning saved doc
} catch (error) {
    console.error('personal.js: Error during save/update operation:', error);
    alert('Error saving data: ' + error.message);
}
    });
    // --- Edit Button Logic ---
    editButton.addEventListener('click', async () => {
        console.log('personal.js: Edit button clicked. Fetching latest data for form population.');
        try {
            const response = await fetch(`http://localhost:3000/api/personal-info/${userId}`);
            if (response.ok) {
                const result = await response.json();
                const data = result.personalInfo || result; // Adjust based on backend response
                populateForm(data); // Populate the form with current data
                showStep(0); // Go back to the first step of the form
                personalForm.style.display = 'block';
                displayInfoSection.style.display = 'none';
                progressTracker.style.display = 'block';
            } else {
                alert('Could not retrieve data for editing. Starting with a blank form.');
                personalForm.reset();
                showStep(0);
                personalForm.style.display = 'block';
                displayInfoSection.style.display = 'none';
                progressTracker.style.display = 'block';
            }
        } catch (error) {
            console.error('personal.js: Network error while trying to fetch data for editing:', error);
            alert('Network error while trying to fetch data for editing. Please try again.');
            personalForm.reset();
            showStep(0);
            personalForm.style.display = 'block';
            displayInfoSection.style.display = 'none';
            progressTracker.style.display = 'block';
        }
    });
});