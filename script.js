document.addEventListener('DOMContentLoaded', () => {
    // --- KILL SERVICE WORKER & CLEAR CACHES ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister().then(() => {
                    console.log('Service Worker unregistered successfully.');
                });
            }
        });
    }
    if ('caches' in window) {
        caches.keys().then((names) => {
            for (let name of names) {
                caches.delete(name);
                console.log('Deleted cache:', name);
            }
        });
    }

    // --- GLOBAL ERROR HANDLING ---
    const setupErrorHandling = () => {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    };

    setupErrorHandling();

    // --- SUPABASE SETUP ---
    let supabaseClient;
    try {
        const SUPABASE_URL = 'https://syvpeftawfakdiebueji.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dnBlZnRhd2Zha2RpZWJ1ZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjMyNDcsImV4cCI6MjA3NTU5OTI0N30.RSR3fp-ooPgSxwCKmMb-Xt2pTrb2cO8w5VJg9bZxaiY';
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Supabase not available or initialization failed:", e);
    }

    // --- AUTHENTICATION & PROFILE LOGIC ---
    let currentUser = null;
    const isLoginPage = window.location.pathname.includes('login.html');

    const updateProfileUI = (user) => {
        const nameDisplays = [document.getElementById('profile-name'), document.getElementById('mobile-profile-name')];
        const emailDisplays = [document.getElementById('profile-email'), document.getElementById('mobile-profile-email')];
        const initialDisplays = [document.getElementById('profile-initial'), document.getElementById('mobile-profile-initial')];
        const regDisplays = [document.getElementById('profile-reg'), document.getElementById('mobile-profile-reg')];
        const phoneDisplays = [document.getElementById('profile-phone-display'), document.getElementById('mobile-profile-phone-display')];
        const avatarDisplays = [document.getElementById('profile-avatar'), document.getElementById('mobile-profile-avatar')];

        const logoutBtns = [document.getElementById('logout-btn-desktop'), document.getElementById('logout-btn-mobile')];
        const editBtns = [document.getElementById('edit-profile-btn'), document.getElementById('edit-mobile-profile-btn')];

        if (user) {
            const fullName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User');
            const regNumber = user.user_metadata?.reg_number || 'Not provided';
            const phoneStr = user.user_metadata?.phone || 'Not provided';

            nameDisplays.forEach(el => el && (el.textContent = fullName));
            emailDisplays.forEach(el => el && (el.textContent = user.email || 'No email'));
            regDisplays.forEach(el => el && (el.textContent = `Reg: ${regNumber}`));
            phoneDisplays.forEach(el => el && (el.textContent = `Phone: ${phoneStr}`));

            const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&size=128&bold=true`;

            avatarDisplays.forEach((el, index) => {
                if (el) {
                    el.src = avatarUrl;
                    el.classList.remove('hidden');
                    el.onerror = () => {
                        // Fallback to showing initial if image fails
                        el.classList.add('hidden');
                        if (initialDisplays[index]) {
                            initialDisplays[index].classList.remove('hidden');
                            initialDisplays[index].textContent = fullName.charAt(0).toUpperCase();
                        }
                    };
                }
            });
            initialDisplays.forEach(el => el && el.classList.add('hidden'));

            logoutBtns.forEach(el => {
                if (el) { el.textContent = 'Sign out'; el.classList.add('text-red-600'); el.classList.remove('text-[var(--accent-color)]'); }
            });
            editBtns.forEach(el => {
                if (el) el.style.display = 'flex'; // show edit buttons
            });
        } else {
            nameDisplays.forEach(el => el && (el.textContent = 'Guest User'));
            emailDisplays.forEach(el => el && (el.textContent = 'Not logged in'));
            regDisplays.forEach(el => el && (el.textContent = 'Reg: Not set'));
            phoneDisplays.forEach(el => el && (el.textContent = 'Phone: Not set'));

            avatarDisplays.forEach(el => el && el.classList.add('hidden'));
            initialDisplays.forEach(el => el && el.classList.remove('hidden'));
            initialDisplays.forEach(el => el && (el.textContent = '?'));

            logoutBtns.forEach(el => {
                if (el) { el.textContent = 'Sign in'; el.classList.remove('text-red-600'); el.classList.add('text-[var(--accent-color)]'); }
            });
            editBtns.forEach(el => {
                if (el) el.style.display = 'none'; // hide edit buttons
            });
        }
    };

    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            currentUser = session?.user || null;
            if (!isLoginPage) {
                updateProfileUI(currentUser);
            }
        });

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            currentUser = session?.user || null;
            if (!isLoginPage) {
                updateProfileUI(currentUser);
            }
        });
    }

    const handleLogoutOrLogin = async () => {
        if (!currentUser) {
            window.location.href = '/login.html';
            return;
        }
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
            window.location.reload();
        }
    };

    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');

    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogoutOrLogin);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogoutOrLogin);

    // --- PROFILE EDITING LOGIC ---
    const setupProfileEditing = () => {
        const editBtnDesktop = document.getElementById('edit-profile-btn');
        const updateFormDesktop = document.getElementById('edit-profile-form');
        const nameInputDesktop = document.getElementById('edit-name-input');
        const regInputDesktop = document.getElementById('edit-reg-input');
        const phoneInputDesktop = document.getElementById('edit-phone-input');
        const saveBtnDesktop = document.getElementById('save-profile-btn');
        const cancelBtnDesktop = document.getElementById('cancel-edit-btn');

        const editBtnMobile = document.getElementById('edit-mobile-profile-btn');
        const updateFormMobile = document.getElementById('mobile-edit-profile-form');
        const nameInputMobile = document.getElementById('mobile-edit-name-input');
        const regInputMobile = document.getElementById('mobile-edit-reg-input');
        const phoneInputMobile = document.getElementById('mobile-edit-phone-input');
        const saveBtnMobile = document.getElementById('mobile-save-profile-btn');
        const cancelBtnMobile = document.getElementById('mobile-cancel-edit-btn');

        const toggleForm = (form, show, user) => {
            if (!form) return;
            if (show) {
                form.classList.remove('hidden');
                const nameInput = form.id.includes('mobile') ? nameInputMobile : nameInputDesktop;
                const regInput = form.id.includes('mobile') ? regInputMobile : regInputDesktop;
                const phoneInput = form.id.includes('mobile') ? phoneInputMobile : phoneInputDesktop;
                if (nameInput) nameInput.value = user?.user_metadata?.full_name || '';
                if (regInput) regInput.value = user?.user_metadata?.reg_number || '';
                if (phoneInput) phoneInput.value = user?.user_metadata?.phone || '';
            } else {
                form.classList.add('hidden');
            }
        };

        const handleSave = async (isMobile) => {
            if (!currentUser || !supabaseClient) return;
            const nameInput = isMobile ? nameInputMobile : nameInputDesktop;
            const regInput = isMobile ? regInputMobile : regInputDesktop;
            const phoneInput = isMobile ? phoneInputMobile : phoneInputDesktop;
            const saveBtn = isMobile ? saveBtnMobile : saveBtnDesktop;

            if (!nameInput || !regInput || !phoneInput) return;

            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            try {
                const { data, error } = await supabaseClient.auth.updateUser({
                    data: { full_name: nameInput.value, reg_number: regInput.value, phone: phoneInput.value }
                });
                if (error) throw error;

                currentUser = data.user;
                updateProfileUI(currentUser);
                toggleForm(isMobile ? updateFormMobile : updateFormDesktop, false);
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("Failed to update profile: " + error.message);
            } finally {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }
        };

        if (editBtnDesktop) editBtnDesktop.addEventListener('click', (e) => { e.stopPropagation(); toggleForm(updateFormDesktop, true, currentUser); });
        if (cancelBtnDesktop) cancelBtnDesktop.addEventListener('click', (e) => { e.stopPropagation(); toggleForm(updateFormDesktop, false); });
        if (saveBtnDesktop) saveBtnDesktop.addEventListener('click', (e) => { e.stopPropagation(); handleSave(false); });

        if (editBtnMobile) editBtnMobile.addEventListener('click', (e) => { e.stopPropagation(); toggleForm(updateFormMobile, true, currentUser); });
        if (cancelBtnMobile) cancelBtnMobile.addEventListener('click', (e) => { e.stopPropagation(); toggleForm(updateFormMobile, false); });
        if (saveBtnMobile) saveBtnMobile.addEventListener('click', (e) => { e.stopPropagation(); handleSave(true); });

        // Prevent form clicks from closing the dropdown
        if (updateFormDesktop) updateFormDesktop.addEventListener('click', (e) => e.stopPropagation());
    };
    setupProfileEditing();

    // Setup Profile Dropdown toggle
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    // --- DATA (Static) ---
    const facultyData = {
        sem1: [
            { name: 'Sandeep Sir', subject: 'EVS', contact: '+91 9164489836', cabin: 'AB2 Basement', email: 'sandeep.gs@manipal.edu' },
            { name: 'Shobha Ma\'am', subject: 'Maths', contact: '+91 9591474101', cabin: 'N/A', email: 'shobha.me@manipal.edu' },
            { name: 'Sowmya Ma\'am', subject: 'Chem', contact: '+91 9686781587', cabin: 'N/A', email: 'sowmya.achar@manipal.edu' },
            { name: 'Anandh Sir', subject: 'FEE', contact: '+91 9787934850', cabin: 'AB1', email: 'anandh.n@manipal.edu' },
            { name: 'Bhagyashree Ma\'am', subject: 'EMSB', contact: '+91 8277511547', cabin: 'AB2 Basement', email: 'bhagyalaxmi.kh@manipal.edu' },
            { name: 'Sujithra Ma\'am', subject: 'PPS', contact: '+91 9047756324', cabin: 'AB5', email: 't.sujithra@manipal.edu' },
            { name: 'Aruna Prabhu', subject: 'CAEG', contact: '+91 9743593045', cabin: 'Cabin6, Chamber 2A, AB1', email: 'aruna.prabhu@manipal.edu' },
            { name: 'Pavan Sir', subject: 'CAEG', contact: '+91 9620819669', cabin: 'N/A', email: 'N/A' },
            { name: 'Girish Sir', subject: 'CAEG', contact: '+91 8951811729', cabin: 'N/A', email: 'N/A' },
        ],
        sem2: [
            { name: 'Cenitta D', subject: 'IOOP (Java)', contact: '+91 9738891473', cabin: 'N/A', email: 'cenitta.d@manipal.edu' },
            { name: 'Raghavendra S', subject: 'DAV (Python)', contact: '+91 9591276777', cabin: 'AB5 Cabin 88', email: 'raghavendra.s@manipal.edu' },
            { name: 'Indira KP', subject: 'Maths', contact: '+91 9901725397', cabin: 'AB2 First Floor', email: 'indira.kp@manipal.edu' },
            { name: 'Bhagyesh', subject: 'Phy', contact: '+91 9481920572', cabin: 'N/A', email: 'bhaghyesh.mit@manipal.edu' },
            { name: 'Gopalakrishna Pai', subject: 'FE', contact: '+91 9113662577', cabin: 'AB5 Ground Floor FC4', email: 'gopalkrishna.pai@manipal.edu' },
            { name: 'Jitendra Katiyar', subject: 'FME', contact: '+91 8090113301', cabin: 'N/A', email: 'jitendra.katiyar@manipal.edu' },
            { name: 'Hari MG', subject: 'English', contact: '+91 9746303781', cabin: 'AB2 Humanities Department FC1', email: 'hari.mg@manipal.edu' },
            { name: 'H Girish', subject: 'Workshop', contact: '+91 8951811729', cabin: 'N/A', email: 'h.girish@manipal.edu' },
        ]
    };
    let currentFacultyTab = 'sem2';

    const restaurants = [
        { name: 'Taco House', contact: '+91 7795815315' },
        { name: 'Hungry House', contact: '+91 9820243177' },
        { name: 'MFC', contact: '+91 7338334970' },
        { name: 'Hit & Run', contact: '+91 7406330088' },
        { name: 'Janani Canteen', contact: '+91 8660138488' },
        { name: 'Dollar Cafe', contact: '+91 8105306109' },
        { name: 'Kamath Cafe', contact: '+91 8217044886' },
        { name: 'Aditya Mess', contact: '+91 7483644586' },
        { name: 'Apoorva Mess', contact: '+91 9108888320' },
        { name: 'FC 2', contact: '+91 8861953102' },
        { name: 'Poornima', contact: '+91 7090641985' },
        { name: 'Nom Nom cafe', contact: '+91 7619422026' },
        { name: 'Ashraya', contact: '+91 6361201519' },
    ];

    const today = new Date();

    // --- PERFORMANCE OPTIMIZATIONS ---
    const setupLazyLoading = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // --- ENHANCED DATA FETCHING WITH CACHING ---
    const cachedFetch = async (key, fetchFunction, ttl = 5 * 60 * 1000) => {
        const cached = localStorage.getItem(key);
        const now = Date.now();

        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (now - timestamp < ttl) {
                return data;
            }
        }

        const freshData = await fetchFunction();
        localStorage.setItem(key, JSON.stringify({
            data: freshData,
            timestamp: now
        }));

        return freshData;
    };

    const fetchWithRetry = async (fetchFunction, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await fetchFunction();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    };

    // --- THEME SWITCHER ---
    const themeSwitchers = document.querySelectorAll('.theme-switcher-btn');
    const allSunIcons = document.querySelectorAll('.theme-icon-sun');
    const allMoonIcons = document.querySelectorAll('.theme-icon-moon');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            allSunIcons.forEach(icon => icon.classList.add('hidden'));
            allMoonIcons.forEach(icon => icon.classList.remove('hidden'));
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            allSunIcons.forEach(icon => icon.classList.remove('hidden'));
            allMoonIcons.forEach(icon => icon.classList.add('hidden'));
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeSwitchers.forEach(button => {
        button.addEventListener('click', () => {
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    });

    // --- ENHANCED MOBILE NAVIGATION ---
    const setupMobileMenu = () => {
        const mobileMenuBtn = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    document.getElementById('menu-open-icon').classList.remove('hidden');
                    document.getElementById('menu-close-icon').classList.add('hidden');
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    document.getElementById('menu-open-icon').classList.remove('hidden');
                    document.getElementById('menu-close-icon').classList.add('hidden');
                }
            });
        }
    };

    // --- PAGE NAVIGATION & ACTIVE LINKS ---
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    const normalizePath = (p) => {
        if (!p) return '/';
        p = p.split('?')[0].split('#')[0];
        p = p.replace(/index\.html$/i, '');
        if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
        return p || '/';
    };

    const setActiveLink = () => {
        const currentPathRaw = window.location.pathname;
        const currentPath = normalizePath(currentPathRaw);
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            const linkPath = normalizePath(linkHref);
            link.classList.remove('active');

            if (linkPath === '/' && currentPath === '/') {
                link.classList.add('active');
            } else if (linkPath !== '/' && (currentPath === linkPath || currentPath.startsWith(linkPath + '/'))) {
                link.classList.add('active');
            } else if (linkPath !== '/' && currentPath === linkPath) {
                link.classList.add('active');
            }
        });
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuOpenIcon.classList.toggle('hidden');
            menuCloseIcon.classList.toggle('hidden');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
                if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
            }
        });
    });

    // Handle faculty page redirect without triggering global click handlers
    const facultyLink = document.querySelector('a[href="/faculty/"]');
    if (facultyLink) {
        facultyLink.addEventListener('click', () => {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
                if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
            }
        });
    }

    setActiveLink();
    setupMobileMenu();

    // --- SEARCH FUNCTIONALITY ---
    const setupSearch = () => {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const performSearch = (searchTerm) => {
            // Search faculty
            const facultyCards = document.querySelectorAll('#faculty-container > div');
            facultyCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });

            // Search restaurants
            const restaurantCards = document.querySelectorAll('#restaurants-container > div');
            restaurantCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        };

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            performSearch(searchTerm);
        });

        // Clear search when page changes
        window.addEventListener('beforeunload', () => {
            searchInput.value = '';
        });
    };

    // --- DYNAMIC CONTENT RENDERING WITH LOADING STATES ---
    const renderDeadlineCards = async () => {
        const assignmentsContainer = document.querySelector('#assignments .space-y-4');
        const quizzesContainer = document.querySelector('#quizzes .space-y-4');

        if (!assignmentsContainer || !quizzesContainer) return;

        if (!supabaseClient) {
            const errorHtml = `<div class="error-message" role="alert"><p>Supabase client not initialized. Cannot load deadlines.</p></div>`;
            assignmentsContainer.innerHTML = errorHtml;
            quizzesContainer.innerHTML = errorHtml;
            return;
        }

        const loadingHtml = `<div class="skeleton-loader rounded-lg h-32"></div>`;
        assignmentsContainer.innerHTML = loadingHtml;
        quizzesContainer.innerHTML = loadingHtml;

        const getDaysRemaining = (dueDate) => {
            const due = new Date(dueDate);
            due.setHours(23, 59, 59, 999);
            const diffTime = due.getTime() - today.getTime();
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        };

        const createCard = (item) => {
            let daysText, daysColorClass, formattedDate;

            if (item.duedate) {
                const daysLeft = getDaysRemaining(item.duedate);
                if (daysLeft < 0) {
                    daysText = 'Overdue';
                    daysColorClass = 'bg-red-500 text-white';
                } else if (daysLeft === 0) {
                    daysText = 'Due Today';
                    daysColorClass = 'bg-red-500 text-white';
                } else if (daysLeft === 1) {
                    daysText = 'Due Tomorrow';
                    daysColorClass = 'bg-orange-500 text-white';
                } else {
                    daysText = `${daysLeft} days left`;
                    daysColorClass = 'bg-green-600 text-white';
                }
                formattedDate = new Date(item.duedate).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            } else {
                daysText = 'No Date';
                daysColorClass = 'bg-gray-400 text-white';
                formattedDate = 'N/A';
            }

            return `
                <div class="bg-[var(--card-bg)] rounded-lg p-4 shadow-md border border-[var(--border-color)] hover-lift fade-in">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-lg text-[var(--header-text)]">${item.subject || 'N/A'}</p>
                            <p class="text-md">${item.title || 'No Title'}</p>
                        </div>
                        <span class="text-xs font-semibold px-3 py-1 rounded-full ${daysColorClass}">${daysText}</span>
                    </div>
                    <p class="text-sm mt-3 opacity-80">Due: ${formattedDate}</p>
                </div>`;
        };

        try {
            const fetchAssignments = () => supabaseClient.from('assignments').select('*');
            const fetchQuizzes = () => supabaseClient.from('quizzes').select('*');

            const [{ data: assignments, error: assignmentsError }, { data: quizzes, error: quizzesError }] = await Promise.all([
                fetchWithRetry(fetchAssignments),
                fetchWithRetry(fetchQuizzes)
            ]);

            if (assignmentsError) throw assignmentsError;
            if (quizzesError) throw quizzesError;

            assignmentsContainer.innerHTML = '';
            quizzesContainer.innerHTML = '';

            const sortedAssignments = (assignments || []).sort((a, b) => {
                if (!a.duedate) return 1;
                if (!b.duedate) return -1;
                return new Date(a.duedate) - new Date(b.duedate);
            });

            if (sortedAssignments.length > 0) {
                sortedAssignments.forEach(ass => {
                    assignmentsContainer.innerHTML += createCard(ass);
                });
            } else {
                assignmentsContainer.innerHTML = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48 fade-in"><h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Upcoming Assignments</h2></div>`;
            }

            const sortedQuizzes = (quizzes || []).sort((a, b) => {
                if (!a.duedate) return 1;
                if (!b.duedate) return -1;
                return new Date(a.duedate) - new Date(b.duedate);
            });

            if (sortedQuizzes.length > 0) {
                sortedQuizzes.forEach(quiz => {
                    quizzesContainer.innerHTML += createCard(quiz);
                });
            } else {
                quizzesContainer.innerHTML = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48 fade-in"><h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Upcoming Quizzes</h2></div>`;
            }

            // Logic to move Quick Actions to the top if there are no assignments or quizzes
            const quickLinksContainer = document.getElementById('quick-links');
            if (quickLinksContainer) {
                const parentCol = quickLinksContainer.parentElement;
                if (sortedAssignments.length === 0 && sortedQuizzes.length === 0) {
                    // Prepend it so it sits above the main content on mobile layout when nothing is taking up primary visual space
                    if (parentCol && parentCol.parentElement && parentCol.classList.contains('lg:col-span-3')) {
                        const gridParent = parentCol.parentElement;
                        // It's already the primary visual on desktop if it spans all 3, but let's make sure its parent row visually responds
                        gridParent.prepend(parentCol);
                    }
                }
            }

        } catch (error) {
            console.error("Error fetching deadline data:", error);
            const errorHtml = `<div class="error-message" role="alert"><p>Could not load data. Please check your connection.</p></div>`;
            assignmentsContainer.innerHTML = errorHtml;
            quizzesContainer.innerHTML = errorHtml;
        }
    };

    const renderCardsOnly = (container) => {
        container.innerHTML = '';
        const currentList = facultyData[currentFacultyTab] || [];

        currentList.forEach(f => {
            const emailButtonHtml = f.email !== 'N/A' ? `
                <div class="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <button data-faculty-name="${f.name}" data-faculty-email="${f.email}" class="compose-email-btn w-full text-center bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--accent-color)] hover:text-white transition-colors duration-300 text-sm focus-outline">
                        Compose Email
                    </button>
                </div>
            ` : '';

            container.innerHTML += `
                <div class="bg-[var(--card-bg)] rounded-lg p-5 shadow-md border border-[var(--border-color)] flex flex-col hover-lift fade-in faculty-card">
                    <h3 class="text-xl font-bold text-[var(--header-text)]">${f.name}</h3>
                    <p class="text-[var(--accent-color)] font-semibold">${f.subject}</p>
                    <div class="mt-4 space-y-2 text-sm flex-grow">
                        <a href="tel:${f.contact}" class="flex items-center text-[var(--accent-color)] hover:underline focus-outline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            ${f.contact}
                        </a>
                        <p class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                            ${f.cabin}
                        </p>
                        <a href="${f.email !== 'N/A' ? 'mailto:' + f.email : '#'}" class="flex items-center ${f.email !== 'N/A' ? 'hover:underline text-[var(--accent-color)]' : 'cursor-default'} focus-outline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            ${f.email}
                        </a>
                    </div>
                    ${emailButtonHtml}
                </div>
            `;
        });
    };

    const renderFacultyCards = () => {
        const container = document.querySelector('#faculty-container');
        if (!container) return;

        // Add search functionality and tabs if on faculty page
        const searchHtml = `
            <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="relative w-full md:max-w-md">
                    <input 
                        type="text" 
                        id="search-input"
                        placeholder="Search faculty..." 
                        class="search-input w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus-outline shadow-sm"
                    >
                    <svg class="search-icon h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <div class="flex bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg p-1 w-full md:w-auto shadow-sm">
                    <button id="tab-sem1" class="flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 text-[var(--text-color)] focus-outline">Sem I</button>
                    <button id="tab-sem2" class="flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-[var(--accent-color)] text-white shadow-sm focus-outline">Sem II</button>
                </div>
            </div>
        `;

        // Only insert if it hasn't been inserted already (to handle re-renders if any)
        if (window.location.pathname.includes('/faculty/') && !document.getElementById('search-input')) {
            container.insertAdjacentHTML('beforebegin', searchHtml);

            const tab1 = document.getElementById('tab-sem1');
            const tab2 = document.getElementById('tab-sem2');
            const searchInput = document.getElementById('search-input');

            const updateTabsUI = () => {
                if (currentFacultyTab === 'sem1') {
                    tab1.classList.add('bg-[var(--accent-color)]', 'text-white', 'shadow-sm');
                    tab1.classList.remove('text-[var(--text-color)]');
                    tab2.classList.remove('bg-[var(--accent-color)]', 'text-white', 'shadow-sm');
                    tab2.classList.add('text-[var(--text-color)]');
                } else {
                    tab2.classList.add('bg-[var(--accent-color)]', 'text-white', 'shadow-sm');
                    tab2.classList.remove('text-[var(--text-color)]');
                    tab1.classList.remove('bg-[var(--accent-color)]', 'text-white', 'shadow-sm');
                    tab1.classList.add('text-[var(--text-color)]');
                }
            };

            tab1.addEventListener('click', () => {
                currentFacultyTab = 'sem1';
                updateTabsUI();
                renderCardsOnly(container);
                if (searchInput) searchInput.dispatchEvent(new Event('input')); // re-apply search
            });

            tab2.addEventListener('click', () => {
                currentFacultyTab = 'sem2';
                updateTabsUI();
                renderCardsOnly(container);
                if (searchInput) searchInput.dispatchEvent(new Event('input')); // re-apply search
            });

            // Initial UI update for tabs since we default to sem2
            updateTabsUI();
        }

        renderCardsOnly(container);
    };

    const renderRestaurantCards = () => {
        const container = document.querySelector('#restaurants-container');
        if (!container) return;

        // Add search functionality if on restaurants page
        const searchHtml = `
            <div class="mb-6">
                <div class="relative max-w-md">
                    <input 
                        type="text" 
                        id="search-input"
                        placeholder="Search restaurants..." 
                        class="search-input w-full pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus-outline"
                    >
                    <svg class="search-icon h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        `;

        if (window.location.pathname.includes('/restaurants/')) {
            container.insertAdjacentHTML('beforebegin', searchHtml);
        }

        container.innerHTML = '';
        restaurants.forEach(r => {
            container.innerHTML += `
                <div class="bg-[var(--card-bg)] rounded-lg p-5 shadow-md border border-[var(--border-color)] hover-lift fade-in">
                    <h3 class="text-xl font-bold text-[var(--header-text)]">${r.name}</h3>
                    <div class="mt-2 text-sm">
                        <a href="tel:${r.contact}" class="flex items-center text-[var(--accent-color)] hover:underline focus-outline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            ${r.contact}
                        </a>
                    </div>
                </div>
            `;
        });
    };

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    };

    const renderAnnouncements = async () => {
        const container = document.querySelector('#notifications .space-y-3');
        if (!container) return;

        if (!supabaseClient) {
            container.innerHTML = `<div class="error-message" role="alert"><p>Supabase client not initialized.</p></div>`;
            return;
        };

        container.innerHTML = `<div class="skeleton-loader rounded-lg h-20"></div>`;

        const handleUpdates = (data) => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48 fade-in">
                        <h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Announcements</h2>
                    </div>`;
                return;
            }

            container.innerHTML = '';
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(ann => {
                const postTime = timeAgo(ann.created_at);
                container.innerHTML += `
                    <div class="bg-[var(--card-bg)] rounded-lg p-4 shadow-sm border border-[var(--border-color)] flex items-start space-x-3 hover-lift fade-in">
                        <div class="flex-shrink-0">
                            <div class="h-8 w-8 rounded-full bg-[var(--accent-color)]/20 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm">${ann.text}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${postTime}</p>
                        </div>
                    </div>
                `;
            });
        };

        try {
            const { data, error } = await fetchWithRetry(() => supabaseClient.from('announcements').select('*'));
            if (error) throw error;
            handleUpdates(data);
        } catch (error) {
            console.error("Supabase error:", error);
            container.innerHTML = `<div class="error-message" role="alert"><p>Could not load announcements. Please check your connection.</p></div>`;
        }

        if (supabaseClient) {
            supabaseClient.channel('custom-all-channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, async (_payload) => {
                    const { data } = await supabaseClient.from('announcements').select('*');
                    handleUpdates(data);
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, (_payload) => {
                    renderDeadlineCards();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, (_payload) => {
                    renderDeadlineCards();
                })
                .subscribe();
        }
    };

    const renderGalleryImages = async () => {
        const placeholder = document.querySelector('#gallery-placeholder');
        const container = document.querySelector('#gallery-container');

        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCloseBtn = document.getElementById('lightbox-close');
        const lightboxPrevBtn = document.getElementById('lightbox-prev');
        const lightboxNextBtn = document.getElementById('lightbox-next');

        if (!container || !placeholder || !lightboxModal) return;

        if (!supabaseClient) {
            placeholder.innerHTML = `<div class="error-message"><h2 class="text-2xl font-bold">Error: Supabase Not Ready</h2></div>`;
            return;
        }

        // Hide "Coming Soon" placeholder and reveal container strictly BEFORE fetch
        placeholder.classList.add('hidden');
        container.classList.remove('hidden');

        // Show skeleton loading
        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full col-span-full">
                ${Array.from({ length: 8 }, () => `
                    <div class="bg-[var(--card-bg)] rounded-lg shadow-md border border-[var(--border-color)] animate-pulse w-full">
                        <div class="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                `).join('')}
            </div>
        `;

        const BUCKET_NAME = 'gallery-images';

        try {
            const { data: files, error } = await fetchWithRetry(() =>
                supabaseClient.storage.from(BUCKET_NAME).list('', {
                    sortBy: { column: 'created_at', order: 'desc' }
                })
            );

            if (error) throw error;

            const imageFiles = files?.filter(file => {
                const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                return allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            });

            if (!imageFiles || imageFiles.length === 0) {
                container.classList.add('hidden');
                placeholder.classList.remove('hidden');
                return;
            }

            // Successfully fetched; clear skeleton array before injecting
            container.innerHTML = '';

            const imageUrls = [];
            let currentIndex = 0;

            imageFiles.forEach((file, index) => {
                const { data: publicUrlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(file.name);

                if (publicUrlData.publicUrl) {
                    imageUrls.push(publicUrlData.publicUrl);

                    const imageElement = document.createElement('div');
                    imageElement.className = 'bg-[var(--card-bg)] rounded-lg shadow-md overflow-hidden border border-[var(--border-color)] hover-lift fade-in';
                    imageElement.innerHTML = `
                        <img data-src="${publicUrlData.publicUrl}" alt="Gallery thumbnail" class="lazy w-full h-48 object-contain transition-transform duration-300 cursor-pointer">
                    `;
                    imageElement.querySelector('img').addEventListener('click', () => {
                        currentIndex = index;
                        showImageAtIndex(currentIndex);
                    });
                    container.appendChild(imageElement);
                }
            });

            function showImageAtIndex(index) {
                lightboxImage.src = imageUrls[index];
                lightboxModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }

            function showNextImage() {
                currentIndex = (currentIndex + 1) % imageUrls.length;
                showImageAtIndex(currentIndex);
            }

            function showPrevImage() {
                currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
                showImageAtIndex(currentIndex);
            }

            lightboxNextBtn.addEventListener('click', showNextImage);
            lightboxPrevBtn.addEventListener('click', showPrevImage);

            const closeLightbox = () => {
                lightboxModal.classList.add('hidden');
                lightboxImage.src = "";
                document.body.style.overflow = 'auto';
            };

            lightboxCloseBtn.addEventListener('click', closeLightbox);
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    closeLightbox();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (!lightboxModal.classList.contains('hidden')) {
                    if (e.key === 'ArrowRight') {
                        showNextImage();
                    } else if (e.key === 'ArrowLeft') {
                        showPrevImage();
                    } else if (e.key === 'Escape') {
                        closeLightbox();
                    }
                }
            });

            // Initialize lazy loading for gallery images
            setupLazyLoading();

        } catch (error) {
            console.error("Error fetching gallery images:", error);
            placeholder.classList.remove('hidden');
            container.classList.add('hidden');
            placeholder.innerHTML = `<div class="error-message"><h2 class="text-2xl font-bold">Could not load images</h2></div>`;
        }
    };

    // --- CALENDAR ENHANCEMENTS ---
    const enhanceCalendar = () => {
        const today = new Date();
        const currentDate = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Highlight today's date
        const calendarCells = document.querySelectorAll('.calendar-table td');
        calendarCells.forEach(cell => {
            const cellDate = parseInt(cell.textContent);
            if (!isNaN(cellDate) && cellDate === currentDate) {
                cell.classList.add('today');
            }
        });
    };

    // --- GEMINI API FEATURES ---
    const callGeminiAPI = async (userQuery, systemPrompt, retries = 3, delay = 1000) => {
        const API_KEY = 'AIzaSyAMOVgh4qSDaB7H1rIagnWtvj6cjJ6gPbI';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nUser Question: " + userQuery }]
                }
            ]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return callGeminiAPI(userQuery, systemPrompt, retries - 1, delay * 2);
                }
                const errorData = await response.json();
                throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from Gemini API.");
            }
        } catch (error) {
            console.error("Gemini API call failed:", error);
            return `Sorry, an error occurred: ${error.message}`;
        }
    };

    // --- AI Study Helper Logic ---
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatLoader = document.getElementById('chat-loader');
    const promptSuggestionBtns = document.querySelectorAll('.prompt-suggestion-btn');

    if (chatInput) {
        const addMessageToChat = (message, sender) => {
            const messageDiv = document.createElement('div');
            let content;
            if (sender === 'user') {
                content = `
                    <div class="flex items-start gap-3 justify-end fade-in">
                        <div class="bg-blue-600 text-white p-3 rounded-lg">
                            <p class="text-sm">${message}</p>
                        </div>
                        <span class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center font-bold">You</span>
                    </div>
                `;
            } else { // AI
                content = `
                    <div class="flex items-start gap-3 fade-in">
                        <span class="flex-shrink-0 h-8 w-8 rounded-full bg-[var(--accent-color)]/20 flex items-center justify-center text-[var(--accent-color)] font-bold">AI</span>
                        <div class="bg-[var(--card-bg)] p-3 rounded-lg border border-[var(--border-color)]">
                            <p class="text-sm">${message}</p>
                        </div>
                    </div>
                `;
            }
            messageDiv.innerHTML = content;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const handleSendMessage = async () => {
            const userQuery = chatInput.value.trim();
            if (!userQuery) return;

            addMessageToChat(userQuery, 'user');
            chatInput.value = '';
            chatLoader.classList.remove('hidden');
            sendChatBtn.disabled = true;

            const systemPrompt = "You are a friendly and encouraging AI tutor for first-year engineering students at MIT Manipal. Your name is 'Circute'. Your goal is to help students understand complex topics by breaking them down into simple, easy-to-understand explanations. Avoid overly technical jargon. Use analogies and real-world examples where possible. Keep your responses concise and focused on the student's question. When asked for practice problems, provide one and then offer to provide the solution.";

            try {
                const aiResponse = await callGeminiAPI(userQuery, systemPrompt);
                addMessageToChat(aiResponse, 'ai');
            } catch (error) {
                addMessageToChat("Sorry, I'm having trouble responding right now. Please try again later.", 'ai');
            } finally {
                chatLoader.classList.add('hidden');
                sendChatBtn.disabled = false;
                chatInput.focus();
            }
        };

        sendChatBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
        promptSuggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chatInput.value = btn.textContent;
                handleSendMessage();
            });
        });
    }

    // --- AI Email Modal Logic ---
    const emailModal = document.getElementById('email-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalEmailToDisplay = document.getElementById('modal-email-to-display');
    const modalEmailToValue = document.getElementById('modal-email-to-value');
    const modalEmailFrom = document.getElementById('modal-email-from');
    const modalEmailRegNo = document.getElementById('modal-email-regno');
    const modalEmailSubject = document.getElementById('modal-email-subject');
    const modalEmailPrompt = document.getElementById('modal-email-prompt');
    const modalGenerateEmailBtn = document.getElementById('modal-generate-email-btn');
    const modalEmailBody = document.getElementById('modal-email-body');
    const modalEmailLoader = document.getElementById('modal-email-loader');
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const copyConfirm = document.getElementById('copy-confirm');
    const sendEmailBtn = document.getElementById('send-email-btn');

    if (emailModal) {
        const openEmailModal = (facultyName, facultyEmail) => {
            modalEmailToDisplay.textContent = `${facultyName} <${facultyEmail}>`;
            modalEmailToValue.value = facultyEmail;

            // Prefer current logged in user from Supabase over raw local storage
            const defaultName = currentUser?.user_metadata?.full_name || localStorage.getItem('userName') || '';
            const defaultRegNo = currentUser?.user_metadata?.reg_number || localStorage.getItem('userRegNo') || '';

            modalEmailFrom.value = defaultName;
            modalEmailRegNo.value = defaultRegNo;

            modalEmailSubject.value = '';
            modalEmailPrompt.value = '';
            modalEmailBody.value = '';
            modalEmailLoader.classList.add('hidden');
            modalGenerateEmailBtn.disabled = false;
            copyConfirm.classList.add('hidden');
            emailModal.classList.remove('hidden');
            emailModal.classList.add('active');
            modalEmailFrom.focus();
        };

        const closeLightbox = () => {
            emailModal.classList.remove('active');
            setTimeout(() => {
                emailModal.classList.add('hidden');
            }, 200);
        };

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.compose-email-btn');
            if (button) {
                const facultyName = button.dataset.facultyName;
                const facultyEmail = button.dataset.facultyEmail;
                openEmailModal(facultyName, facultyEmail);
            }
        });

        closeModalBtn.addEventListener('click', closeLightbox);
        emailModal.addEventListener('click', (e) => {
            if (e.target === emailModal) {
                closeLightbox();
            }
        });

        modalGenerateEmailBtn.addEventListener('click', async () => {
            const recipientName = modalEmailToDisplay.textContent.split('<')[0].trim();
            const fromName = modalEmailFrom.value.trim();
            const regNo = modalEmailRegNo.value.trim();
            const subject = modalEmailSubject.value.trim();
            const prompt = modalEmailPrompt.value.trim();

            if (!recipientName || !fromName || !regNo || !subject || !prompt) {
                modalEmailBody.value = "Please fill in all fields (Your Name, Registration No., Subject and Prompt) before generating the email.";
                return;
            }

            localStorage.setItem('userName', fromName);
            localStorage.setItem('userRegNo', regNo);

            modalEmailLoader.classList.remove('hidden');
            modalGenerateEmailBtn.disabled = true;
            modalEmailBody.value = "";

            const fullPrompt = `Recipient: ${recipientName}. Subject: "${subject}". Core message/request from student: "${prompt}". My name is ${fromName} and my registration number is ${regNo}.`;
            const systemPrompt = `You are an AI assistant helping a first-year engineering student ('${fromName}') draft a professional and respectful email to their professor. Given the recipient's name, the subject, and the core message, write a complete email body. Start with a polite salutation (e.g., 'Dear Prof. [Name],'), write the body based on the student's prompt, and end with a professional closing (e.g., 'Sincerely,', 'Best regards,'). The closing should be followed by the student's name on one line, and their registration number on the next line. The tone should be formal yet courteous. For example, the closing should look like:\n\nBest regards,\n${fromName}\nReg. No.: ${regNo}`;

            try {
                const aiResponse = await callGeminiAPI(fullPrompt, systemPrompt);
                modalEmailBody.value = aiResponse;
            } catch (error) {
                modalEmailBody.value = "Sorry, there was an error generating the email. Please try again.";
            } finally {
                modalEmailLoader.classList.add('hidden');
                modalGenerateEmailBtn.disabled = false;
            }
        });

        copyEmailBtn.addEventListener('click', () => {
            if (modalEmailBody.value) {
                navigator.clipboard.writeText(modalEmailBody.value).then(() => {
                    copyConfirm.classList.remove('hidden');
                    setTimeout(() => {
                        copyConfirm.classList.add('hidden');
                    }, 2000);
                });
            }
        });

        sendEmailBtn.addEventListener('click', () => {
            const email = modalEmailToValue.value;
            const subject = modalEmailSubject.value;
            const body = modalEmailBody.value;

            if (!email || !body) {
                return;
            }

            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            const mailtoLink = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
            window.location.href = mailtoLink;
        });
    }

    // --- DAILY QUOTE WIDGET ---
    const renderDailyQuote = () => {
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        if (!quoteText || !quoteAuthor) return;

        const quotes = [
            { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "— Martin Fowler" },
            { text: "First, solve the problem. Then, write the code.", author: "— John Johnson" },
            { text: "Experience is the name everyone gives to their mistakes.", author: "— Oscar Wilde" },
            { text: "Knowledge is power.", author: "— Francis Bacon" },
            { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "— Dan Salomon" },
            { text: "It's not a bug. It's an undocumented feature!", author: "— Anonymous" },
            { text: "The only way to do great work is to love what you do.", author: "— Steve Jobs" },
            { text: "Before software can be reusable it first has to be usable.", author: "— Ralph Johnson" },
            { text: "Optimism is an occupational hazard of programming: feedback is the treatment.", author: "— Kent Beck" }
        ];

        // Pick one based on the current day to change daily, or randomly on refresh
        // Let's go with random on refresh to make it dynamic
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const selectedQuote = quotes[randomIndex];

        quoteText.textContent = `"${selectedQuote.text}"`;
        quoteAuthor.textContent = selectedQuote.author;
    };

    // --- INITIALIZE ALL FEATURES ---
    const initializeApp = () => {
        renderDailyQuote();
        renderDeadlineCards();
        renderFacultyCards();
        renderRestaurantCards();
        renderAnnouncements();
        renderGalleryImages();
        enhanceCalendar();
        setupSearch();
        setupLazyLoading();
    };

    // Start the application
    initializeApp();
});