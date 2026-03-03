document.addEventListener('DOMContentLoaded', () => {
    console.log('extracurricular.js: DOM Content Loaded!');

    const form = document.getElementById('extracurricularForm');
    const editBtn = document.getElementById('editBtn');
    const summarySection = document.getElementById('summarySection');
    const formSection = document.getElementById('formSection');

    // Check if these core elements exist
    if (!form || !editBtn || !summarySection || !formSection) {
        console.error('extracurricular.js: One or more critical HTML elements are missing. Check IDs: extracurricularForm, editBtn, summarySection, formSection');
        // Prevent further script execution if crucial elements are missing
        alert('Page setup error: Cannot find form or summary sections. Please check HTML.');
        return;
    }

    const numHackathonsInput = document.getElementById('numHackathons');
    const hackathonDetailsContainer = document.getElementById('hackathonDetailsContainer');

    const numEventsInput = document.getElementById('numEvents');
    const eventDetailsContainer = document.getElementById('eventDetailsContainer');

    const numAwardsInput = document.getElementById('numAwards');
    const awardDetailsContainer = document.getElementById('awardDetailsContainer');

    const numCertificatesInput = document.getElementById('numCertificates');
    const certificateDetailsContainer = document.getElementById('certificateDetailsContainer');

    const fieldsets = form.querySelectorAll('fieldset');
    let currentStep = 0;

    const userId = sessionStorage.getItem('user_id'); // Get the user ID from session storage
    console.log('extracurricular.js: Retrieved userId from sessionStorage:', userId);

    if (!userId) {
        alert('User not logged in. Please log in to manage extracurricular details.');
        console.error('extracurricular.js: User ID is missing in sessionStorage. Script execution stopped for data fetch/display.');
        // Optionally redirect to login page
        // window.location.href = 'login.html';
        // Still attempt to show form in case user is meant to fill out first time
        summarySection.style.display = 'none';
        formSection.style.display = 'block';
        if (fieldsets.length > 0) goToStep(0); // Only go to step if fieldsets exist
        return; // Stop further execution if no user ID
    }

    // Stores fetched data for pre-filling
    let fetchedData = {
        hackathons: [],
        events: [],
        awards: [],
        certificates: []
    };

    // Helper: generate dynamic inputs and handle add/remove correctly
    function generateInputs(container, prefix, count, fields, existingData = []) {
        const currentCount = container.children.length;
        console.log(`Generating inputs for ${prefix}: current=${currentCount}, target=${count}`);

        if (count > currentCount) {
            // Add inputs
            for (let i = currentCount; i < count; i++) {
                const div = document.createElement('div');
                div.classList.add(prefix + '-group');
                div.dataset.index = i;

                let innerHTML = `<h4>${capitalize(prefix)} #${i + 1}</h4>`;
                fields.forEach(field => {
                    const fieldValue = existingData[i] ? existingData[i][field.dbName] : '';
                    if (field.type === 'textarea') {
                        innerHTML += `
                            <label>
                                ${field.label}:
                                <textarea name="${prefix}${field.name}_${i}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${fieldValue}</textarea>
                            </label>
                        `;
                    } else {
                        innerHTML += `
                            <label>
                                ${field.label}:
                                <input type="${field.type}" name="${prefix}${field.name}_${i}" placeholder="${field.placeholder || ''}" value="${fieldValue}" ${field.required ? 'required' : ''} />
                            </label>
                        `;
                    }
                });
                if (existingData[i] && existingData[i].id) {
                    innerHTML += `<input type="hidden" name="${prefix}Id_${i}" value="${existingData[i].id}">`;
                }
                div.innerHTML = innerHTML;
                container.appendChild(div);
            }
        } else if (count < currentCount) {
            // Remove extra inputs
            for (let i = currentCount - 1; i >= count; i--) {
                const childToRemove = container.querySelector(`.${prefix}-group[data-index="${i}"]`);
                if (childToRemove) container.removeChild(childToRemove);
            }
        }
    }

    // Capitalize first letter helper
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Define field structures for each category, mapping to DB column names
    const fieldDefinitions = {
        hackathon: [
            { name: 'Role', label: 'Role in Hackathon', type: 'text', placeholder: 'e.g., Developer', required: true, dbName: 'role' },
            { name: 'Tech', label: 'Technologies Used', type: 'text', placeholder: 'e.g., Python, React, AI', required: true, dbName: 'technologies' },
            { name: 'Project', label: 'Project Developed', type: 'textarea', placeholder: 'Brief description', required: true, dbName: 'project' },
        ],
        event: [
            { name: 'Name', label: 'Event Name', type: 'text', placeholder: 'Event Name', required: true, dbName: 'name' },
            { name: 'Type', label: 'Event Type', type: 'text', placeholder: 'e.g., Debate, Sports', required: false, dbName: 'type' },
            { name: 'Award', label: 'Award/Recognition', type: 'text', placeholder: 'Any awards', required: false, dbName: 'award' },
            { name: 'Date', label: 'Date', type: 'date', required: false, dbName: 'date' },
        ],
        award: [
            { name: 'Name', label: 'Award Name', type: 'text', placeholder: 'Award Name', required: true, dbName: 'name' },
            { name: 'Org', label: 'Awarding Organization', type: 'text', placeholder: 'Organization', required: false, dbName: 'organization' },
            { name: 'Date', label: 'Date Received', type: 'date', required: false, dbName: 'date' },
            { name: 'Desc', label: 'Description', type: 'textarea', placeholder: 'Brief description', required: false, dbName: 'description' },
        ],
        certificate: [
            { name: 'Name', label: 'Certificate Name', type: 'text', placeholder: 'Certificate Name', required: true, dbName: 'name' },
            { name: 'Org', label: 'Issuing Organization', type: 'text', placeholder: 'Organization', required: false, dbName: 'organization' },
            { name: 'Date', label: 'Date Issued', type: 'date', required: false, dbName: 'date' },
            { name: 'Desc', label: 'Description', type: 'textarea', placeholder: 'Brief description', required: false, dbName: 'description' },
        ],
    };

    // --- Event listeners for number inputs to generate fields ---
    numHackathonsInput.addEventListener('input', () => {
        const count = parseInt(numHackathonsInput.value) || 0;
        generateInputs(hackathonDetailsContainer, 'hackathon', count, fieldDefinitions.hackathon, fetchedData.hackathons);
    });

    numEventsInput.addEventListener('input', () => {
        const count = parseInt(numEventsInput.value) || 0;
        generateInputs(eventDetailsContainer, 'event', count, fieldDefinitions.event, fetchedData.events);
    });

    numAwardsInput.addEventListener('input', () => {
        const count = parseInt(numAwardsInput.value) || 0;
        generateInputs(awardDetailsContainer, 'award', count, fieldDefinitions.award, fetchedData.awards);
    });

    numCertificatesInput.addEventListener('input', () => {
        const count = parseInt(numCertificatesInput.value) || 0;
        generateInputs(certificateDetailsContainer, 'certificate', count, fieldDefinitions.certificate, fetchedData.certificates);
    });

    // --- Navigation buttons: next & back ---
    form.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Next button clicked. Current step:', currentStep);
            if (!validateStep(currentStep)) return;
            goToStep(currentStep + 1);
        });
    });

    form.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Back button clicked. Current step:', currentStep);
            goToStep(currentStep - 1);
        });
    });

    // Show specified step in multi-step form
    function goToStep(step) {
        if (step < 0 || step >= fieldsets.length) {
            console.warn(`goToStep: Invalid step requested: ${step}. Total fieldsets: ${fieldsets.length}`);
            return;
        }
        console.log(`Transitioning from step ${currentStep} to step ${step}`);
        fieldsets[currentStep].classList.remove('active');
        fieldsets[step].classList.add('active');
        currentStep = step;
        // Also ensure visibility via display property for smooth transitions
        fieldsets.forEach((fs, idx) => {
            fs.style.display = (idx === currentStep) ? 'block' : 'none';
        });
    }

    // Basic validation: check required inputs in current step
    function validateStep(step) {
        const inputs = fieldsets[step].querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        for (const input of inputs) {
            if (!input.value.trim()) {
                input.focus();
                alert('Please fill all required fields in this section.');
                isValid = false;
                break; // Stop at the first invalid input
            }
        }
        console.log(`Validation for step ${step}: ${isValid ? 'Passed' : 'Failed'}`);
        return isValid;
    }

    // --- Initial Load: Fetch and Display Summary or Form ---
    async function fetchAndDisplayExtracurricular() {
        console.log('extracurricular.js: fetchAndDisplayExtracurricular called.');

        // Initialize counts to 0 by default, these will always be displayed
        let hackathonsCount = 0;
        let eventsCount = 0;
        let awardsCount = 0;
        let certificatesCount = 0;

        // Ensure summary elements are updated immediately with 0s
        document.getElementById('summaryHackathons').textContent = hackathonsCount;
        document.getElementById('summaryEvents').textContent = eventsCount;
        document.getElementById('summaryAwards').textContent = awardsCount;
        document.getElementById('summaryCertificates').textContent = certificatesCount;
        console.log('extracurricular.js: Summary counts initialized to 0.');


        try {
            const response = await fetch(`http://localhost:3000/api/extracurricular/${userId}`);
            console.log('extracurricular.js: API response status for fetch:', response.status);

            if (response.status === 404) {
                console.log('extracurricular.js: No records found (404). Showing form.');
                summarySection.style.display = 'none';
                formSection.style.display = 'block';
                goToStep(0); // Go to the first step of the form

                // Reset number inputs and clear containers for new entry
                numHackathonsInput.value = 0;
                numEventsInput.value = 0;
                numAwardsInput.value = 0;
                numCertificatesInput.value = 0;

                // Trigger input events to ensure dynamic fields are cleared/generated
                numHackathonsInput.dispatchEvent(new Event('input'));
                numEventsInput.dispatchEvent(new Event('input'));
                numAwardsInput.dispatchEvent(new Event('input'));
                numCertificatesInput.dispatchEvent(new Event('input'));

            } else if (response.ok) { // Status 200 (OK)
                const data = await response.json();
                console.log('extracurricular.js: Data fetched successfully:', data);
                fetchedData.hackathons = data.hackathons || [];
                fetchedData.events = data.events || [];
                fetchedData.awards = data.awards || [];
                fetchedData.certificates = data.certificates || [];

                hackathonsCount = fetchedData.hackathons.length;
                eventsCount = fetchedData.events.length;
                awardsCount = fetchedData.awards.length;
                certificatesCount = fetchedData.certificates.length;

                // Update summary with actual fetched counts
                document.getElementById('summaryHackathons').textContent = hackathonsCount;
                document.getElementById('summaryEvents').textContent = eventsCount;
                document.getElementById('summaryAwards').textContent = awardsCount;
                document.getElementById('summaryCertificates').textContent = certificatesCount;
                console.log('extracurricular.js: Summary counts updated with fetched data.');

                summarySection.style.display = 'block'; // SHOW SUMMARY
                formSection.style.display = 'none'; // HIDE FORM

            } else {
                console.error('extracurricular.js: Error fetching data. Status:', response.status, response.statusText);
                alert('Failed to load extracurricular data due to a server error. Please try again.');
                summarySection.style.display = 'none'; // Hide summary on error
                formSection.style.display = 'block'; // Show form as fallback
                goToStep(0); // Go to the first step of the form
            }

        } catch (error) {
            console.error('extracurricular.js: Network or unhandled error during fetch:', error);
            alert('An error occurred while fetching data. Please check your network connection and the server.');
            summarySection.style.display = 'none'; // Hide summary on network error
            formSection.style.display = 'block'; // Show form as fallback
            goToStep(0); // Go to the first step of the form
        }
    }

    // --- Form Submission Handler ---
    form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('extracurricular.js: Form submission initiated.');

        // Final validation for the current step (which should be the last step for submission)
        if (!validateStep(currentStep)) {
            console.warn('extracurricular.js: Final validation failed on submission.');
            return;
        }

        const formData = new FormData(form);
        const submissionData = {
            userId: userId, // Include user ID
            hackathons: [],
            events: [],
            awards: [],
            certificates: []
        };

        // Helper to process form data for a category
        const processCategory = (numInput, prefix, fieldDefs, targetArray) => {
            const count = parseInt(numInput.value) || 0;
            for (let i = 0; i < count; i++) {
                const item = { id: formData.get(`${prefix}Id_${i}`) || null };
                fieldDefs.forEach(field => {
                    item[field.dbName] = formData.get(`${prefix}${field.name}_${i}`);
                });
                targetArray.push(item);
            }
        };

        processCategory(numHackathonsInput, 'hackathon', fieldDefinitions.hackathon, submissionData.hackathons);
        processCategory(numEventsInput, 'event', fieldDefinitions.event, submissionData.events);
        processCategory(numAwardsInput, 'award', fieldDefinitions.award, submissionData.awards);
        processCategory(numCertificatesInput, 'certificate', fieldDefinitions.certificate, submissionData.certificates);

        console.log('extracurricular.js: Submission data prepared:', submissionData);

        try {
            const response = await fetch('http://localhost:3000/api/extracurricular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();
            console.log('extracurricular.js: Server response to submission:', result);

            if (response.ok) {
                alert(result.message || 'Extracurricular details saved successfully!');
                // Re-fetch and display the updated summary
                await fetchAndDisplayExtracurricular(); // This will refresh the summary counts
                goToStep(0); // Reset form to first step (it will be hidden by fetchAndDisplayExtracurricular)
            } else {
                alert(result.message || 'Failed to save extracurricular details.');
                console.error('extracurricular.js: Error saving extracurricular details:', result);
            }
        } catch (error) {
            console.error('extracurricular.js: Network error during submission:', error);
            alert('An error occurred. Please check your network and try again.');
        }
    });

    // --- Edit button loads saved data back into form ---
    editBtn.addEventListener('click', async () => {
        console.log('extracurricular.js: Edit button clicked.');
        // Show form, hide summary
        summarySection.style.display = 'none';
        formSection.style.display = 'block';

        // Clear all detail containers before re-generating with fetched data
        hackathonDetailsContainer.innerHTML = '';
        eventDetailsContainer.innerHTML = '';
        awardDetailsContainer.innerHTML = '';
        certificateDetailsContainer.innerHTML = '';
        console.log('extracurricular.js: Cleared dynamic input containers.');

        // Fetch the latest data to populate the form for editing
        try {
            const response = await fetch(`http://localhost:3000/api/extracurricular/${userId}`);
            const data = await response.json();
            console.log('extracurricular.js: Data fetched for editing:', data);

            fetchedData.hackathons = data.hackathons || [];
            fetchedData.events = data.events || [];
            fetchedData.awards = data.awards || [];
            fetchedData.certificates = data.certificates || [];

            // Set number inputs and trigger their 'input' events to generate dynamic fields
            // The generateInputs function uses `WorkspaceedData` to pre-fill
            numHackathonsInput.value = fetchedData.hackathons.length;
            numHackathonsInput.dispatchEvent(new Event('input'));

            numEventsInput.value = fetchedData.events.length;
            numEventsInput.dispatchEvent(new Event('input'));

            numAwardsInput.value = fetchedData.awards.length;
            numAwardsInput.dispatchEvent(new Event('input'));

            numCertificatesInput.value = fetchedData.certificates.length;
            numCertificatesInput.dispatchEvent(new Event('input'));

            console.log('extracurricular.js: Form populated with fetched data.');
            goToStep(0); // Go to the first step of the form
        } catch (error) {
            console.error('extracurricular.js: Error fetching data for edit:', error);
            alert('Failed to load data for editing. Please try again.');
            summarySection.style.display = 'block'; // Fallback to summary
            formSection.style.display = 'none';
        }
    });

    // Initialize display on page load
    console.log('extracurricular.js: Initializing display on page load.');
    fetchAndDisplayExtracurricular();
});