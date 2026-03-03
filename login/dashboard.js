window.onload = async function () {
    // --- 0. Real-Time Date Feature ---
    const today = new Date();
    
    // Format for Profile Card (e.g., Monday, February 16, 2026)
    const profileOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateDisplay = document.getElementById('currentDateDisplay');
    if (dateDisplay) {
        dateDisplay.textContent = today.toLocaleDateString(undefined, profileOptions);
    }

    // Format for Academic Card (e.g., 16 Feb 2026)
    const cardOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const academicDateSpan = document.getElementById('academicDate');
    if (academicDateSpan) {
        academicDateSpan.textContent = today.toLocaleDateString('en-GB', cardOptions);
    }

    // --- 1. User Session & Profile Setup ---
    const userId = sessionStorage.getItem('user_id');
    const username = sessionStorage.getItem('username');

    if (!userId) {
        console.warn('User not logged in. Redirecting to login...');
        window.location.href = 'index.html'; 
        return;
    }

    // Update the Profile Name in the UI (replace "Hi ABC" with actual name)
    const profileDisplay = document.getElementById('profileUserName');
    if (profileDisplay) {
        profileDisplay.textContent = username || 'Student';
    }

    // Load saved emoji from localStorage
    const savedEmoji = localStorage.getItem(`edumatrix_emoji_${userId}`);
    if (savedEmoji) {
        document.getElementById('profileEmoji').textContent = savedEmoji;
    }

    // Update referral links with user ID
    const referralLink = `https://edumatrix.com/ref/${userId}`;
    const referralInputs = document.querySelectorAll('#referralLink, #modalReferralLink');
    referralInputs.forEach(input => {
        if (input) input.value = referralLink;
    });

    // --- 2. Semester Persistence (localStorage) ---
    const semSelect = document.getElementById('semSelect');
    const displaySem = document.getElementById('displaySemester');
    
    // Load saved semester from localStorage
    const savedSemester = localStorage.getItem(`edumatrix_semester_${userId}`);
    let defaultSem = savedSemester ? parseInt(savedSemester) : 1;
    
    if (semSelect) {
        semSelect.value = defaultSem;
        // Update the display
        if (displaySem) displaySem.textContent = defaultSem;
        // Update progress bar
        updateSemesterProgress(defaultSem);
    }

    // --- 3. Data Fetching Functions ---

    // Fetch Academic Stats based on Semester
    async function loadAcademicStats(semester) {
        try {
            const academicRes = await fetch(`http://localhost:3000/api/academic-info/${userId}`);
            const academicData = await academicRes.json();
            const academicInfoDiv = document.getElementById("academicInfo");

            if (academicRes.ok && academicData.academicInfo && academicData.academicInfo.length > 0) {
                // Find data for the selected semester
                const semData = academicData.academicInfo.find(r => r.semester == semester);
                
                if (semData) {
                    academicInfoDiv.innerHTML = `
                        <div class="space-y-1 text-left">
                            <p><strong>Semester:</strong> ${semData.semester}</p>
                            <p><strong>SGPA:</strong> ${semData.sgpa || 'N/A'}</p>
                            <p><strong>Attendance:</strong> ${semData.attendance || '0'}%</p>
                        </div>
                    `;
                } else {
                    academicInfoDiv.innerHTML = `<p class='text-gray-400 italic'>No data for Sem ${semester}</p>`;
                }
            } else {
                academicInfoDiv.innerHTML = "<p class='text-gray-400 italic'>No records found.</p>";
            }
        } catch (error) {
            console.error('❌ Academic Fetch Error:', error);
        }
    }

    // Function to update semester progress bar
    function updateSemesterProgress(semester) {
        const progressPercent = (semester / 8) * 100;
        const yellowBar = document.getElementById('semProgressBarYellow');
        const darkBlueBar = document.getElementById('semProgressBarBlue');

        if (yellowBar && darkBlueBar) {
            yellowBar.style.width = progressPercent + "%";
            darkBlueBar.style.width = (100 - progressPercent) + "%";
            darkBlueBar.style.left = progressPercent + "%";
        }
        
        if (displaySem) displaySem.textContent = semester;
    }

    // --- 4. Event Listeners ---
    
    // Semester Change Listener (with localStorage persistence)
    semSelect?.addEventListener('change', (e) => {
        const selectedSem = parseInt(e.target.value);
        
        // Save to localStorage
        localStorage.setItem(`edumatrix_semester_${userId}`, selectedSem);
        
        // Update the display
        updateSemesterProgress(selectedSem);
        
        // Load database data for the new semester
        loadAcademicStats(selectedSem);
    });

    // Logout Listener
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });

    // --- 5. Calendar Logic ---
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    const calendarDates = document.getElementById('calendarDates');
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function renderCalendar() {
        if (!calendarDates || !calendarMonthYear) return;
        calendarDates.innerHTML = ''; 
        calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let day = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                cell.className = "p-1 text-center text-xs cursor-pointer hover:bg-blue-100 rounded-full";
                if (i === 0 && j < firstDay) {
                    cell.textContent = '';
                } else if (day <= daysInMonth) {
                    cell.textContent = day;
                    if (currentMonth === today.getMonth() && currentYear === today.getFullYear() && day === today.getDate()) {
                        cell.className = "p-1 text-center text-xs bg-[#0b4dbd] text-white rounded-full font-bold";
                    }
                    day++;
                }
                row.appendChild(cell);
            }
            calendarDates.appendChild(row);
            if (day > daysInMonth) break;
        }
    }

    document.getElementById('prevMonthBtn')?.addEventListener('click', () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); });
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); });

    // --- 6. Share and Refer a Friend Functionality ---
    
    // Copy link functions
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
            button.classList.add('bg-green-500');
            button.classList.remove('bg-[#0b4dbd]');
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-500');
                button.classList.add('bg-[#0b4dbd]');
            }, 2000);
        });
    }

    // Copy link button in sidebar
    document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
        const linkInput = document.getElementById('referralLink');
        const button = document.getElementById('copyLinkBtn');
        copyToClipboard(linkInput.value, button);
    });

    // Modal copy button
    document.getElementById('modalCopyLink')?.addEventListener('click', () => {
        const linkInput = document.getElementById('modalReferralLink');
        const button = document.getElementById('modalCopyLink');
        copyToClipboard(linkInput.value, button);
    });

    // Share modal functions
    const shareModal = document.getElementById('shareModal');
    
    document.getElementById('shareBtn')?.addEventListener('click', () => {
        shareModal.classList.remove('hidden');
        shareModal.classList.add('flex');
    });

    document.getElementById('closeShareModal')?.addEventListener('click', () => {
        shareModal.classList.add('hidden');
        shareModal.classList.remove('flex');
    });

    shareModal?.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.add('hidden');
            shareModal.classList.remove('flex');
        }
    });

    // Social media share functions
    const shareText = "Check out EduMatrix - The best student management system!";
    const shareUrl = referralLink;

    function shareOnSocial(platform) {
        let url = '';
        switch(platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
                break;
        }
        if (url) window.open(url, '_blank', 'width=600,height=400');
    }

    // Sidebar social share buttons
    document.getElementById('shareWhatsApp')?.addEventListener('click', () => shareOnSocial('whatsapp'));
    document.getElementById('shareFacebook')?.addEventListener('click', () => shareOnSocial('facebook'));
    document.getElementById('shareTwitter')?.addEventListener('click', () => shareOnSocial('twitter'));
    document.getElementById('shareLinkedIn')?.addEventListener('click', () => shareOnSocial('linkedin'));

    // Modal social share buttons
    document.getElementById('modalShareWhatsApp')?.addEventListener('click', () => shareOnSocial('whatsapp'));
    document.getElementById('modalShareFacebook')?.addEventListener('click', () => shareOnSocial('facebook'));
    document.getElementById('modalShareTwitter')?.addEventListener('click', () => shareOnSocial('twitter'));
    document.getElementById('modalShareLinkedIn')?.addEventListener('click', () => shareOnSocial('linkedin'));

    // --- 7. Emoji Picker Functionality ---
    const emojiModal = document.getElementById('emojiModal');
    const profileEmojiBtn = document.getElementById('profileEmojiBtn');
    
    profileEmojiBtn?.addEventListener('click', () => {
        emojiModal.classList.remove('hidden');
        emojiModal.classList.add('flex');
    });

    document.getElementById('closeEmojiModal')?.addEventListener('click', () => {
        emojiModal.classList.add('hidden');
        emojiModal.classList.remove('flex');
    });

    emojiModal?.addEventListener('click', (e) => {
        if (e.target === emojiModal) {
            emojiModal.classList.add('hidden');
            emojiModal.classList.remove('flex');
        }
    });

    // Handle emoji selection
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            document.getElementById('profileEmoji').textContent = emoji;
            // Save emoji to localStorage
            localStorage.setItem(`edumatrix_emoji_${userId}`, emoji);
            emojiModal.classList.add('hidden');
            emojiModal.classList.remove('flex');
        });
    });

    // --- 8. Set Goals Functionality ---
    const goalsModal = document.getElementById('goalsModal');
    const setGoalsBtn = document.getElementById('setGoalsBtn');
    
    setGoalsBtn?.addEventListener('click', () => {
        loadGoals(); // Load existing goals before showing modal
        goalsModal.classList.remove('hidden');
        goalsModal.classList.add('flex');
    });

    document.getElementById('closeGoalsModal')?.addEventListener('click', () => {
        goalsModal.classList.add('hidden');
        goalsModal.classList.remove('flex');
    });

    goalsModal?.addEventListener('click', (e) => {
        if (e.target === goalsModal) {
            goalsModal.classList.add('hidden');
            goalsModal.classList.remove('flex');
        }
    });

    // Handle goals form submission
    document.getElementById('goalsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const goals = {
            sgpa: document.getElementById('goalSgpa').value,
            attendance: document.getElementById('goalAttendance').value,
            studyHours: document.getElementById('goalStudyHours').value,
            books: document.getElementById('goalBooks').value,
            hackathons: document.getElementById('goalHackathons').value,
            certificates: document.getElementById('goalCertificates').value,
            note: document.getElementById('goalNote').value
        };
        
        // Save goals to localStorage
        localStorage.setItem(`edumatrix_goals_${userId}`, JSON.stringify(goals));
        
        alert('Goals saved successfully!');
        displayGoals(goals);
    });

    function loadGoals() {
        const savedGoals = localStorage.getItem(`edumatrix_goals_${userId}`);
        if (savedGoals) {
            const goals = JSON.parse(savedGoals);
            document.getElementById('goalSgpa').value = goals.sgpa || '';
            document.getElementById('goalAttendance').value = goals.attendance || '';
            document.getElementById('goalStudyHours').value = goals.studyHours || '';
            document.getElementById('goalBooks').value = goals.books || '';
            document.getElementById('goalHackathons').value = goals.hackathons || '';
            document.getElementById('goalCertificates').value = goals.certificates || '';
            document.getElementById('goalNote').value = goals.note || '';
            displayGoals(goals);
        }
    }

    function displayGoals(goals) {
        const goalsDisplay = document.getElementById('goalsDisplay');
        const goalsList = document.getElementById('goalsList');
        
        let html = '';
        if (goals.sgpa) html += `<p>🎯 SGPA Target: ${goals.sgpa}</p>`;
        if (goals.attendance) html += `<p>📊 Attendance: ${goals.attendance}%</p>`;
        if (goals.studyHours) html += `<p>⏰ Study Hours: ${goals.studyHours}/week</p>`;
        if (goals.books) html += `<p>📚 Books: ${goals.books}</p>`;
        if (goals.hackathons) html += `<p>💻 Hackathons: ${goals.hackathons}</p>`;
        if (goals.certificates) html += `<p>🏆 Certificates: ${goals.certificates}</p>`;
        if (goals.note) html += `<p>📝 Note: ${goals.note}</p>`;
        
        if (html) {
            goalsList.innerHTML = html;
            goalsDisplay.classList.remove('hidden');
        }
    }

    // --- 9. Initial Execution ---
    renderCalendar();
    loadAcademicStats(defaultSem);
};
