document.addEventListener('DOMContentLoaded', () => {
    // --- API Configuration ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://edumatrix-bu32.onrender.com';

    console.log('extracurricular.js: DOM Content Loaded!');

    const form = document.getElementById('extracurricularForm');
    const editBtn = document.getElementById('editBtn');
    const summarySection = document.getElementById('summarySection');
    const formSection = document.getElementById('formSection');

    if (!form || !editBtn || !summarySection || !formSection) {
        console.error('extracurricular.js: One or more critical HTML elements are missing.');
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

    const userId = sessionStorage.getItem('user_id');
    console.log('extracurricular.js: Retrieved userId from sessionStorage:', userId);

    if (!userId) {
        alert('User not logged in. Please log in to manage extracurricular details.');
        summarySection.style.display = 'none';
        formSection.style.display = 'block';
        if (fieldsets.length > 0) goToStep(0);
        return;
    }

    let fetchedData = {
        hackathons: [],
        events: [],
        awards: [],
        certificates: []
    };

    function generateInputs(container, prefix, count, fields, existingData = []) {
        const currentCount = container.children.length;
        console.log(`Generating inputs for ${prefix}: current=${currentCount}, target=${count}`);

        if (count > currentCount) {
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
            for (let i = currentCount - 1; i >= count; i--) {
                const childToRemove = container.querySelector(`.${prefix}-group[data-index="${i}"]`);
                if (childToRemove) container.removeChild(childToRemove);
            }
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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

    form.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!validateStep(currentStep)) return;
            goToStep(currentStep + 1);
        });
    });

    form.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });

    function goToStep(step) {
        if (step < 0 || step >= fieldsets.length) return;
        fieldsets[currentStep].classList.remove('active');
        fieldsets[step].classList.add('active');
        currentStep = step;
        fieldsets.forEach((fs, idx) => {
            fs.style.display = (idx === currentStep) ? 'block' : 'none';
        });
    }

    function validateStep(step) {
        const inputs = fieldsets[step].querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        for (const input of inputs) {
            if (!input.value.trim()) {
                input.focus();
                alert('Please fill all required fields in this section.');
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    async function fetchAndDisplayExtracurricular() {
        console.log('extracurricular.js: fetchAndDisplayExtracurricular called.');

        try {
            const response = await fetch(`${API_BASE_URL}/api/extracurricular/${userId}`);

            if (response.status === 404) {
                // No data found - show the form
                showForm();
            } else if (response.ok) {
                const data = await response.json();
                fetchedData.hackathons = data.hackathons || [];
                fetchedData.events = data.events || [];
                fetchedData.awards = data.awards || [];
                fetchedData.certificates = data.certificates || [];

                const hackathonsCount = fetchedData.hackathons.length;
                const eventsCount = fetchedData.events.length;
                const awardsCount = fetchedData.awards.length;
                const certificatesCount = fetchedData.certificates.length;

                document.getElementById('summaryHackathons').textContent = hackathonsCount;
                document.getElementById('summaryEvents').textContent = eventsCount;
                document.getElementById('summaryAwards').textContent = awardsCount;
                document.getElementById('summaryCertificates').textContent = certificatesCount;

                // Check if there's any data - if not, show form
                if (hackathonsCount === 0 && eventsCount === 0 && awardsCount === 0 && certificatesCount === 0) {
                    showForm();
                } else {
                    // Show summary
                    summarySection.style.display = 'block';
                    formSection.style.display = 'none';
                }
            } else {
                showForm();
            }
        } catch (error) {
            console.error('extracurricular.js: Network error:', error);
            // On error, show the form
            showForm();
        }
    }

    function showForm() {
        summarySection.style.display = 'none';
        formSection.style.display = 'block';
        goToStep(0);
        numHackathonsInput.value = 0;
        numEventsInput.value = 0;
        numAwardsInput.value = 0;
        numCertificatesInput.value = 0;
        numHackathonsInput.dispatchEvent(new Event('input'));
        numEventsInput.dispatchEvent(new Event('input'));
        numAwardsInput.dispatchEvent(new Event('input'));
        numCertificatesInput.dispatchEvent(new Event('input'));
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        const formData = new FormData(form);
        const submissionData = {
            userId: userId,
            hackathons: [],
            events: [],
            awards: [],
            certificates: []
        };

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

        try {
            const response = await fetch(`${API_BASE_URL}/api/extracurricular`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || 'Extracurricular details saved successfully!');
                await fetchAndDisplayExtracurricular();
                goToStep(0);
            } else {
                alert(result.message || 'Failed to save extracurricular details.');
            }
        } catch (error) {
            console.error('extracurricular.js: Network error:', error);
            alert('An error occurred. Please check your network.');
        }
    });

    editBtn.addEventListener('click', async () => {
        summarySection.style.display = 'none';
        formSection.style.display = 'block';

        hackathonDetailsContainer.innerHTML = '';
        eventDetailsContainer.innerHTML = '';
        awardDetailsContainer.innerHTML = '';
        certificateDetailsContainer.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/extracurricular/${userId}`);
            const data = await response.json();

            fetchedData.hackathons = data.hackathons || [];
            fetchedData.events = data.events || [];
            fetchedData.awards = data.awards || [];
            fetchedData.certificates = data.certificates || [];

            numHackathonsInput.value = fetchedData.hackathons.length;
            numHackathonsInput.dispatchEvent(new Event('input'));
            numEventsInput.value = fetchedData.events.length;
            numEventsInput.dispatchEvent(new Event('input'));
            numAwardsInput.value = fetchedData.awards.length;
            numAwardsInput.dispatchEvent(new Event('input'));
            numCertificatesInput.value = fetchedData.certificates.length;
            numCertificatesInput.dispatchEvent(new Event('input'));

            goToStep(0);
        } catch (error) {
            console.error('extracurricular.js: Error fetching data:', error);
            alert('Failed to load data for editing.');
            summarySection.style.display = 'block';
            formSection.style.display = 'none';
        }
    });

    console.log('extracurricular.js: Initializing display.');
    fetchAndDisplayExtracurricular();
});
