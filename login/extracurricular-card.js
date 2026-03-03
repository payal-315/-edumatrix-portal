// extracurricular-card.js

document.addEventListener('DOMContentLoaded', async () => {
    console.log('extracurricular-card.js: DOM Content Loaded!');

    const summaryContainer = document.getElementById('summaryContainer');
    const goBackBtn = document.getElementById('goBackBtn'); // For "Edit Details"
    const loadingMessage = document.getElementById('loadingMessage');
    const noActivitiesMessage = document.getElementById('noActivitiesMessage');

    // Retrieve userId from sessionStorage
    const userId = sessionStorage.getItem('user_id'); // Ensure this matches what you set in login.js
    console.log('extracurricular-card.js: Retrieved userId from sessionStorage:', userId);

    if (!userId) {
        console.error('extracurricular-card.js: User ID not found in sessionStorage. Cannot fetch extracurricular data.');
        loadingMessage.style.display = 'none'; // Hide loading
        noActivitiesMessage.textContent = "User not logged in. Please log in.";
        noActivitiesMessage.style.display = 'block'; // Show error message
        return;
    }

    // Function to fetch and display extracurricular data
    async function fetchAndDisplayExtracurricularSummary() {
        loadingMessage.style.display = 'block'; // Show loading message
        noActivitiesMessage.style.display = 'none'; // Hide no activities message
        summaryContainer.innerHTML = ''; // Clear existing content

        try {
            // Fetch data from your backend API
            const response = await fetch(`http://localhost:3000/api/extracurricular/${userId}`);
            console.log('extracurricular-card.js: API response status for fetch:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('extracurricular-card.js: No extracurricular data found for this user (404).');
                    noActivitiesMessage.style.display = 'block'; // Show no activities message
                } else {
                    const errorData = await response.json();
                    console.error('extracurricular-card.js: Failed to fetch extracurricular data:', errorData);
                    noActivitiesMessage.textContent = `Error fetching data: ${errorData.message || response.statusText}`;
                    noActivitiesMessage.style.display = 'block';
                }
                loadingMessage.style.display = 'none'; // Hide loading
                return;
            }

            const result = await response.json();
            console.log('extracurricular-card.js: Fetched extracurricular data:', result);

            loadingMessage.style.display = 'none'; // Hide loading once data is fetched

            // The backend returns an object with hackathons, events, awards, certificates arrays
            const data = result; // Assuming your backend directly returns the object { hackathons: [], events: [], ... }

            // Helper to create card with title and items list
            function createCard(title, items, itemFormatter) {
                const card = document.createElement('div');
                card.classList.add('extracurricular-card'); // Use this specific class

                const h3 = document.createElement('h3'); // Changed to h3
                h3.textContent = title;
                card.appendChild(h3);

                if (items && items.length > 0) {
                    const ul = document.createElement('ul');
                    items.forEach((item, index) => { // Added index for better logging
                        const li = document.createElement('li');
                        li.innerHTML = itemFormatter(item, index); // Pass index to formatter
                        ul.appendChild(li);
                    });
                    card.appendChild(ul);
                } else {
                    const p = document.createElement('p');
                    p.classList.add('no-details');
                    p.textContent = 'No data available.';
                    card.appendChild(p);
                }
                return card;
            }

            // Define how to format each type of item for display
            const formatters = {
                hackathon: (item) => `<strong>Role:</strong> ${item.role || 'N/A'}<br><strong>Technologies:</strong> ${item.technologies || 'N/A'}<br><strong>Project:</strong> ${item.project || 'N/A'}`,
                event: (item, index) => {
                    console.log(`extracurricular-card.js: Event [${index}] raw date:`, item.date); // NEW LOG
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    console.log(`extracurricular-card.js: Event [${index}] formatted date:`, dateFormatted); // NEW LOG
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Type:</strong> ${item.type || 'N/A'}<br><strong>Award:</strong> ${item.award || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}`;
                },
                award: (item, index) => {
                    console.log(`extracurricular-card.js: Award [${index}] raw date:`, item.date); // NEW LOG
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    console.log(`extracurricular-card.js: Award [${index}] formatted date:`, dateFormatted); // NEW LOG
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Organization:</strong> ${item.organization || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}<br><strong>Description:</strong> ${item.description || 'N/A'}`;
                },
                certificate: (item, index) => {
                    console.log(`extracurricular-card.js: Certificate [${index}] raw date:`, item.date); // NEW LOG
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    console.log(`extracurricular-card.js: Certificate [${index}] formatted date:`, dateFormatted); // NEW LOG
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Organization:</strong> ${item.organization || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}<br><strong>Description:</strong> ${item.description || 'N/A'}`;
                }
            };

            // Append cards to container
            summaryContainer.appendChild(createCard('Hackathons Participated', data.hackathons, formatters.hackathon));
            summaryContainer.appendChild(createCard('Events Participated', data.events, formatters.event));
            summaryContainer.appendChild(createCard('Awards Won', data.awards, formatters.award));
            summaryContainer.appendChild(createCard('Certificates Earned', data.certificates, formatters.certificate));

            // If no individual sections have data, show the overall "no activities" message
            if (data.hackathons.length === 0 && data.events.length === 0 && data.awards.length === 0 && data.certificates.length === 0) {
                noActivitiesMessage.style.display = 'block';
            } else {
                noActivitiesMessage.style.display = 'none'; // Ensure it's hidden if data is present
            }

        } catch (error) {
            console.error('extracurricular-card.js: Network or parsing error during fetch:', error);
            loadingMessage.style.display = 'none'; // Hide loading
            noActivitiesMessage.textContent = 'Failed to load activities. Please check your network connection and server.';
            noActivitiesMessage.style.display = 'block';
        }
    }

    // Initial fetch and display
    fetchAndDisplayExtracurricularSummary();

    // Go back button logic (navigate back to form page)
    goBackBtn.addEventListener('click', () => {
        window.location.href = 'extracurricular.html';
    });
});