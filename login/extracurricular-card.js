// extracurricular-card.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- API Configuration ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://edumatrix-bu32.onrender.com';

    console.log('extracurricular-card.js: DOM Content Loaded!');

    const summaryContainer = document.getElementById('summaryContainer');
    const goBackBtn = document.getElementById('goBackBtn');
    const loadingMessage = document.getElementById('loadingMessage');
    const noActivitiesMessage = document.getElementById('noActivitiesMessage');

    const userId = sessionStorage.getItem('user_id');
    console.log('extracurricular-card.js: Retrieved userId from sessionStorage:', userId);

    if (!userId) {
        console.error('extracurricular-card.js: User ID not found in sessionStorage.');
        loadingMessage.style.display = 'none';
        noActivitiesMessage.textContent = "User not logged in. Please log in.";
        noActivitiesMessage.style.display = 'block';
        return;
    }

    async function fetchAndDisplayExtracurricularSummary() {
        loadingMessage.style.display = 'block';
        noActivitiesMessage.style.display = 'none';
        summaryContainer.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/extracurricular/${userId}`);
            console.log('extracurricular-card.js: API response status:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('extracurricular-card.js: No data found (404).');
                    noActivitiesMessage.style.display = 'block';
                } else {
                    const errorData = await response.json();
                    console.error('extracurricular-card.js: Error:', errorData);
                    noActivitiesMessage.textContent = `Error: ${errorData.message || response.statusText}`;
                    noActivitiesMessage.style.display = 'block';
                }
                loadingMessage.style.display = 'none';
                return;
            }

            const result = await response.json();
            console.log('extracurricular-card.js: Data fetched:', result);

            loadingMessage.style.display = 'none';

            const data = result;

            function createCard(title, items, itemFormatter) {
                const card = document.createElement('div');
                card.classList.add('extracurricular-card');

                const h3 = document.createElement('h3');
                h3.textContent = title;
                card.appendChild(h3);

                if (items && items.length > 0) {
                    const ul = document.createElement('ul');
                    items.forEach((item, index) => {
                        const li = document.createElement('li');
                        li.innerHTML = itemFormatter(item, index);
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

            const formatters = {
                hackathon: (item) => `<strong>Role:</strong> ${item.role || 'N/A'}<br><strong>Technologies:</strong> ${item.technologies || 'N/A'}<br><strong>Project:</strong> ${item.project || 'N/A'}`,
                event: (item) => {
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Type:</strong> ${item.type || 'N/A'}<br><strong>Award:</strong> ${item.award || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}`;
                },
                award: (item) => {
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Organization:</strong> ${item.organization || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}<br><strong>Description:</strong> ${item.description || 'N/A'}`;
                },
                certificate: (item) => {
                    const dateFormatted = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
                    return `<strong>Name:</strong> ${item.name || 'N/A'}<br><strong>Organization:</strong> ${item.organization || 'N/A'}<br><strong>Date:</strong> ${dateFormatted}<br><strong>Description:</strong> ${item.description || 'N/A'}`;
                }
            };

            summaryContainer.appendChild(createCard('Hackathons Participated', data.hackathons, formatters.hackathon));
            summaryContainer.appendChild(createCard('Events Participated', data.events, formatters.event));
            summaryContainer.appendChild(createCard('Awards Won', data.awards, formatters.award));
            summaryContainer.appendChild(createCard('Certificates Earned', data.certificates, formatters.certificate));

            if (data.hackathons.length === 0 && data.events.length === 0 && data.awards.length === 0 && data.certificates.length === 0) {
                noActivitiesMessage.style.display = 'block';
            } else {
                noActivitiesMessage.style.display = 'none';
            }

        } catch (error) {
            console.error('extracurricular-card.js: Network error:', error);
            loadingMessage.style.display = 'none';
            noActivitiesMessage.textContent = 'Failed to load activities. Please check your network.';
            noActivitiesMessage.style.display = 'block';
        }
    }

    fetchAndDisplayExtracurricularSummary();

    goBackBtn.addEventListener('click', () => {
        window.location.href = 'extracurricular.html';
    });
});
