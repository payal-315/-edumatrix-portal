window.onload = async function () {
    // --- API Configuration ---
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : 'https://edumatrix-bu32.onrender.com';

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

    // Update referral links - use Netlify URL
    const referralLink = `https://edumatrix-portal.netlify.app/`;
    const referralInputs = document.querySelectorAll('#referralLink, #modalReferralLink');
    referralInputs.forEach(input => {
        if (input) input.value = referralLink;
    });

    // --- 2. Dark/Light Theme Toggle ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const body = document.body;
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem(`edumatrix_theme_${userId}`) || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
    }
    
    // Update theme toggle button icon
    function updateThemeIcon() {
        const isDark = body.classList.contains('dark-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }
    updateThemeIcon();
    
    // Theme toggle click handler
    themeToggleBtn?.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        body.classList.toggle('light-theme');
        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem(`edumatrix_theme_${userId}`, isDark ? 'dark' : 'light');
        updateThemeIcon();
    });

    // --- 3. Semester Persistence (localStorage) ---
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
        // Load data for the semester
        loadAcademicStats(defaultSem);
    }

    // --- 4. Data Fetching Functions ---

    // Fetch Academic Stats based on Semester
    async function loadAcademicStats(semester) {
        try {
            const academicRes = await fetch(`${API_BASE_URL}/api/academic-info/${userId}`);
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

    async function loadPersonalInfo() {
        try {
            const personalRes = await fetch(`${API_BASE_URL}/api/personal-info/${userId}`);
            const personalData = await personalRes.json();
            const personalInfoDiv = document.getElementById("personalInfo");

            if (personalRes.ok && personalData.personalInfo) {
                const p = personalData.personalInfo;
                personalInfoDiv.innerHTML = `
                    <div class="space-y-1">
                        <p><strong>Email:</strong> ${p.email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${p.phone || 'N/A'}</p>
                        <p><strong>Blood:</strong> ${p.blood_group || 'N/A'}</p>
                    </div>
                `;
                const personalBar = document.getElementById('personalProgressBar');
                if (personalBar) personalBar.style.width = "100%";
            } else {
                personalInfoDiv.innerHTML = "<p class='text-gray-400 italic'>Details missing.</p>";
            }
        } catch (error) {
            console.error('❌ Personal Fetch Error:', error);
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

    // --- 5. Event Listeners ---
    
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

    // --- 6. Calendar Logic ---
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

    // --- 7. Share and Refer a Friend Functionality ---
    
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

    // Mobile share button
    document.getElementById('mobileShareBtn')?.addEventListener('click', () => {
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

    // --- 8. Set Goals Functionality ---
    const goalsModal = document.getElementById('goalsModal');
    const goalsForm = document.getElementById('goalsForm');
    const goalsDisplay = document.getElementById('goalsDisplay');
    const goalsList = document.getElementById('goalsList');
    let isEditMode = false;
    
    // Add click event to Set Goals button using ID
    document.getElementById('setGoalsBtn')?.addEventListener('click', () => {
        isEditMode = false;
        loadGoalsForModal();
        goalsModal.classList.remove('hidden');
        goalsModal.classList.add('flex');
    });

    // View Goals button - opens modal to view/edit
    document.getElementById('viewGoalsBtn')?.addEventListener('click', () => {
        loadGoalsForModal();
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

    // Load goals from localStorage/API and populate form
    function loadGoalsForModal() {
        // First try to load from localStorage
        const savedGoals = localStorage.getItem(`edumatrix_goals_${userId}`);
        let goals = savedGoals ? JSON.parse(savedGoals) : null;
        
        // Also try to fetch from API
        fetch(`${API_BASE_URL}/api/goals/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.goals) {
                    goals = data.goals;
                    localStorage.setItem(`edumatrix_goals_${userId}`, JSON.stringify(goals));
                }
                
                if (goals) {
                    // Fill form with saved goals
                    if (goals.goal_sgpa) document.getElementById('goalSgpa').value = goals.goal_sgpa;
                    if (goals.goal_attendance) document.getElementById('goalAttendance').value = goals.goal_attendance;
                    if (goals.goal_study_hours) document.getElementById('goalStudyHours').value = goals.goal_study_hours;
                    if (goals.goal_books) document.getElementById('goalBooks').value = goals.goal_books;
                    if (goals.goal_hackathons) document.getElementById('goalHackathons').value = goals.goal_hackathons;
                    if (goals.goal_certificates) document.getElementById('goalCertificates').value = goals.goal_certificates;
                    if (goals.goal_note) document.getElementById('goalNote').value = goals.goal_note;
                    
                    // Display saved goals
                    displayGoals(goals);
                    
                    // Also update the Goals card on dashboard
                    updateGoalsCard(goals);
                }
            })
            .catch(err => {
                console.log('Using local goals:', err);
                if (goals) {
                    if (goals.goalSgpa) document.getElementById('goalSgpa').value = goals.goalSgpa;
                    if (goals.goalAttendance) document.getElementById('goalAttendance').value = goals.goalAttendance;
                    if (goals.goalStudyHours) document.getElementById('goalStudyHours').value = goals.goalStudyHours;
                    if (goals.goalBooks) document.getElementById('goalBooks').value = goals.goalBooks;
                    if (goals.goalHackathons) document.getElementById('goalHackathons').value = goals.goalHackathons;
                    if (goals.goalCertificates) document.getElementById('goalCertificates').value = goals.goalCertificates;
                    if (goals.goalNote) document.getElementById('goalNote').value = goals.goalNote;
                    displayGoals(goals);
                    updateGoalsCard(goals);
                }
            })
    }

    // Update Goals card on the dashboard
    function updateGoalsCard(goals) {
        const goalsInfoSummary = document.getElementById('goalsInfoSummary');
        const goalsProgressBar = document.getElementById('goalsProgressBar');
        const goalsProgressText = document.getElementById('goalsProgressText');
        
        if (goals) {
            // Count how many goals are set
            let goalsSet = 0;
            let totalGoals = 6;
            if (goals.goal_sgpa || goals.goalSgpa) goalsSet++;
            if (goals.goal_attendance || goals.goalAttendance) goalsSet++;
            if (goals.goal_study_hours || goals.goalStudyHours) goalsSet++;
            if (goals.goal_books || goals.goalBooks) goalsSet++;
            if (goals.goal_hackathons || goals.goalHackathons) goalsSet++;
            if (goals.goal_certificates || goals.goalCertificates) goalsSet++;
            
            const progressPercent = (goalsSet / totalGoals) * 100;
            
            if (goalsInfoSummary) {
                goalsInfoSummary.innerHTML = `
                    <div class="text-left text-xs">
                        <p>🎯 SGPA: ${goals.goal_sgpa || goals.goalSgpa || 'N/A'}</p>
                        <p>📊 Attendance: ${goals.goal_attendance || goals.goalAttendance || 'N/A'}%</p>
                        <p>📚 Study: ${goals.goal_study_hours || goals.goalStudyHours || 'N/A'}hrs</p>
                    </div>
                `;
            }
            
            if (goalsProgressBar) {
                goalsProgressBar.style.width = progressPercent + '%';
            }
            
            if (goalsProgressText) {
                goalsProgressText.textContent = Math.round(progressPercent) + '%';
            }
        }
    }

    // Display goals in the modal
    function displayGoals(goals) {
        let html = '';
        const g = goals || {};
        if (g.goal_sgpa || g.goalSgpa) html += `<p>🎯 SGPA Target: <strong>${g.goal_sgpa || g.goalSgpa}</strong></p>`;
        if (g.goal_attendance || g.goalAttendance) html += `<p>📊 Attendance Target: <strong>${g.goal_attendance || g.goalAttendance}%</strong></p>`;
        if (g.goal_study_hours || g.goalStudyHours) html += `<p>📚 Weekly Study Hours: <strong>${g.goal_study_hours || g.goalStudyHours} hrs</strong></p>`;
        if (g.goal_books || g.goalBooks) html += `<p>📖 Books to Read: <strong>${g.goal_books || g.goalBooks}</strong></p>`;
        if (g.goal_hackathons || g.goalHackathons) html += `<p>💻 Hackathons: <strong>${g.goal_hackathons || g.goalHackathons}</strong></p>`;
        if (g.goal_certificates || g.goalCertificates) html += `<p>🏅 Certificates: <strong>${g.goal_certificates || g.goalCertificates}</strong></p>`;
        if (g.goal_note || g.goalNote) html += `<p>📝 Note: ${g.goal_note || g.goalNote}</p>`;
        
        if (html) {
            goalsList.innerHTML = html;
            goalsDisplay.classList.remove('hidden');
        } else {
            goalsDisplay.classList.add('hidden');
        }
    }

    // Save goals to database via API
    goalsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const goals = {
            goal_sgpa: document.getElementById('goalSgpa').value,
            goal_attendance: document.getElementById('goalAttendance').value,
            goal_study_hours: document.getElementById('goalStudyHours').value,
            goal_books: document.getElementById('goalBooks').value,
            goal_hackathons: document.getElementById('goalHackathons').value,
            goal_certificates: document.getElementById('goalCertificates').value,
            goal_note: document.getElementById('goalNote').value
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/goals/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goals)
            });
            
            if (response.ok) {
                localStorage.setItem(`edumatrix_goals_${userId}`, JSON.stringify(goals));
                alert('Goals saved successfully!');
                displayGoals(goals);
                updateGoalsCard(goals);
                goalsModal.classList.add('hidden');
                goalsModal.classList.remove('flex');
            } else {
                alert('Failed to save goals. Please try again.');
            }
        } catch (error) {
            console.error('Error saving goals:', error);
            localStorage.setItem(`edumatrix_goals_${userId}`, JSON.stringify(goals));
            alert('Goals saved locally (offline mode)!');
            displayGoals(goals);
            updateGoalsCard(goals);
            goalsModal.classList.add('hidden');
            goalsModal.classList.remove('flex');
        }
    });

    // --- 9. Emoji Picker Functionality ---
    const emojiModal = document.getElementById('emojiModal');
    
    document.getElementById('profileEmojiBtn')?.addEventListener('click', () => {
        emojiModal.classList.remove('hidden');
        emojiModal.classList.add('flex');
    });

    // Mobile emoji button - opens emoji picker from hamburger menu
    document.getElementById('mobileEmojiBtn')?.addEventListener('click', () => {
        emojiModal.classList.remove('hidden');
        emojiModal.classList.add('flex');
    });

    // Mobile emoji button in profile section
    document.getElementById('profileEmojiBtnMobile')?.addEventListener('click', () => {
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
            const selectedEmoji = btn.dataset.emoji;
            // Update desktop emoji
            document.getElementById('profileEmoji').textContent = selectedEmoji;
            // Update mobile emoji
            const mobileEmoji = document.getElementById('profileEmojiMobile');
            if (mobileEmoji) mobileEmoji.textContent = selectedEmoji;
            localStorage.setItem(`edumatrix_emoji_${userId}`, selectedEmoji);
            emojiModal.classList.add('hidden');
            emojiModal.classList.remove('flex');
        });
    });

    // Load saved emoji - both desktop and mobile
    const savedEmoji = localStorage.getItem(`edumatrix_emoji_${userId}`);
    if (savedEmoji) {
        document.getElementById('profileEmoji').textContent = savedEmoji;
        const mobileEmoji = document.getElementById('profileEmojiMobile');
        if (mobileEmoji) mobileEmoji.textContent = savedEmoji;
    }

    // --- 10. Initial Execution ---
    renderCalendar();
    loadPersonalInfo();
};
