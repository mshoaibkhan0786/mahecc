document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE SETUP ---
    let supabaseClient;
    try {
        const SUPABASE_URL = 'https://syvpeftawfakdiebueji.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dnBlZnRhd2Zha2RpZWJ1ZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjMyNDcsImV4cCI6MjA3NTU5OTI0N30.RSR3fp-ooPgSxwCKmMb-Xt2pTrb2cO8w5VJg9bZxaiY';
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Supabase not available or initialization failed:", e);
    }

    // --- Authentication Guard ---
    const protectPage = async () => {
        if (!supabaseClient) return; 

        const { data: { session } } = await supabaseClient.auth.getSession();
        const isLoginPage = window.location.pathname.includes('/login');

        if (!session && !isLoginPage) {
            window.location.href = '/login/';
        }
    };
    protectPage();

    // --- PROFILE & LOGOUT ---
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileDropdownContainer = document.getElementById('profile-dropdown-container');
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');

    const handleLogout = async () => {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        } else {
            window.location.href = '/login/';
        }
    };
    
    // --- REFACTORED PROFILE LOGIC ---

    const updateProfileDOM = (user) => {
        if (!user) return;
        
        const email = user.email;
        const phone = user.user_metadata?.phone || 'Not available';
        const name = user.user_metadata?.full_name || email.split('@')[0];
        const initial = name ? name.charAt(0).toUpperCase() : '?';

        document.getElementById('profile-initial').textContent = initial;
        document.getElementById('profile-name').textContent = name;
        document.getElementById('profile-email').textContent = email;
        document.getElementById('profile-phone').textContent = `Contact: ${phone}`;

        document.getElementById('mobile-profile-initial').textContent = initial;
        document.getElementById('mobile-profile-name').textContent = name;
        document.getElementById('mobile-profile-email').textContent = email;
    };
    
    const setupNameEditing = () => {
        const editNameBtn = document.getElementById('edit-name-btn');
        const saveNameBtn = document.getElementById('save-name-btn');
        const cancelEditNameBtn = document.getElementById('cancel-edit-name-btn');
        const editNameForm = document.getElementById('edit-name-form');
        const editNameInput = document.getElementById('edit-name-input');
        const nameDisplayContainer = document.getElementById('name-display-container');
        const mobileEditNameBtn = document.getElementById('mobile-edit-name-btn');
        const mobileSaveNameBtn = document.getElementById('mobile-save-name-btn');
        const mobileCancelEditNameBtn = document.getElementById('mobile-cancel-edit-name-btn');
        const mobileEditNameForm = document.getElementById('mobile-edit-name-form');
        const mobileEditNameInput = document.getElementById('mobile-edit-name-input');
        const mobileNameDisplay = document.getElementById('mobile-name-display');

        const startEditingName = () => {
            const currentName = document.getElementById('profile-name').textContent;
            editNameInput.value = currentName;
            mobileEditNameInput.value = currentName;
            nameDisplayContainer.classList.add('hidden');
            editNameForm.classList.remove('hidden');
            mobileNameDisplay.classList.add('hidden');
            mobileEditNameForm.classList.remove('hidden');
        };

        const cancelEditingName = () => {
            nameDisplayContainer.classList.remove('hidden');
            editNameForm.classList.add('hidden');
            mobileNameDisplay.classList.remove('hidden');
            mobileEditNameForm.classList.add('hidden');
        };

        const saveNewName = async () => {
            const newName = (mobileEditNameForm.classList.contains('hidden') ? editNameInput.value : mobileEditNameInput.value).trim();
            if (!newName) return;

            saveNameBtn.disabled = true;
            mobileSaveNameBtn.disabled = true;
            saveNameBtn.textContent = 'Saving...';
            mobileSaveNameBtn.textContent = 'Saving...';

            const { data, error } = await supabaseClient.auth.updateUser({
                data: { full_name: newName }
            });

            if (error) {
                console.error('Error updating name:', error);
            } else if (data.user) {
                updateProfileDOM(data.user);
            }
            
            saveNameBtn.disabled = false;
            mobileSaveNameBtn.disabled = false;
            saveNameBtn.textContent = 'Save';
            mobileSaveNameBtn.textContent = 'Save';
            cancelEditingName();
        };

        if(editNameBtn) editNameBtn.addEventListener('click', startEditingName);
        if(cancelEditNameBtn) cancelEditNameBtn.addEventListener('click', cancelEditingName);
        if(saveNameBtn) saveNameBtn.addEventListener('click', saveNewName);

        if(mobileEditNameBtn) mobileEditNameBtn.addEventListener('click', startEditingName);
        if(mobileCancelEditNameBtn) mobileCancelEditNameBtn.addEventListener('click', cancelEditingName);
        if(mobileSaveNameBtn) mobileSaveNameBtn.addEventListener('click', saveNewName);
    };

    const initializeProfile = async () => {
        if (!supabaseClient || !profileDropdownContainer) return;
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
            updateProfileDOM(user);
            profileDropdownContainer.classList.remove('hidden');
            setupNameEditing();
        }
    };

    // --- INITIAL CALLS ---
    initializeProfile();
    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

    document.addEventListener('click', (event) => {
        if (!profileBtn || !profileDropdown) return;
        const isClickInsideButton = profileBtn.contains(event.target);
        if (isClickInsideButton) {
            profileDropdown.classList.toggle('hidden');
        } else if (!profileDropdown.contains(event.target)) {
            profileDropdown.classList.add('hidden');
        }
    });

    // --- DATA (Static) ---
     const faculty = [
        { name: 'Sandeep Sir', subject: 'EVS', contact: '+91 9164489836', cabin: 'AB2 Basement', email: 'sandeep.gs@manipal.edu' },
        { name: 'Shobha Ma\'am', subject: 'Maths', contact: '+91 9591474101', cabin: 'N/A', email: 'shobha.me@manipal.edu' },
        { name: 'Sowmya Ma\'am', subject: 'Chem', contact: '+91 9686781587', cabin: 'N/A', email: 'sowmya.achar@manipal.edu' },
        { name: 'Anandh Sir', subject: 'FEE', contact: '+91 9787934850', cabin: 'N/A', email: 'anandh.n@manipal.edu' },
        { name: 'Bhagyashree Ma\'am', subject: 'EMSB', contact: '+91 8277511547', cabin: 'AB2 Basement', email: 'bhagyalaxmi.kh@manipal.edu' },
        { name: 'Sujithra Ma\'am', subject: 'PPS', contact: '+91 9047756324', cabin: 'AB5', email: 't.sujithra@manipal.edu' },
    ];
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

    setActiveLink();


    // --- DYNAMIC CONTENT RENDERING ---
    const renderDeadlineCards = async () => {
        const assignmentsContainer = document.querySelector('#assignments .space-y-4');
        const quizzesContainer = document.querySelector('#quizzes .space-y-4');
        
        if (!assignmentsContainer || !quizzesContainer) return;

        if (!supabaseClient) {
            const errorHtml = `<div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert"><p>Supabase client not initialized. Cannot load deadlines.</p></div>`;
            assignmentsContainer.innerHTML = errorHtml;
            quizzesContainer.innerHTML = errorHtml;
            return;
        }

        const loadingHtml = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)]"><p class="text-sm text-gray-500 dark:text-gray-400">Loading...</p></div>`;
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
                <div class="bg-[var(--card-bg)] rounded-lg p-4 shadow-md border border-[var(--border-color)]">
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
            const { data: assignments, error: assignmentsError } = await supabaseClient.from('assignments').select('*');
            if (assignmentsError) throw assignmentsError;

            const { data: quizzes, error: quizzesError } = await supabaseClient.from('quizzes').select('*');
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
                assignmentsContainer.innerHTML = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48"><h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Upcoming Assignments</h2></div>`;
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
                quizzesContainer.innerHTML = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48"><h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Upcoming Quizzes</h2></div>`;
            }

        } catch(error) {
            console.error("Error fetching deadline data:", error);
            const errorHtml = `<div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert"><p>Could not load data. Check RLS policies.</p></div>`;
            assignmentsContainer.innerHTML = errorHtml;
            quizzesContainer.innerHTML = errorHtml;
        }
    };

    const renderFacultyCards = () => {
        const container = document.querySelector('#faculty-container');
        if (!container) return; 

        container.innerHTML = '';
        faculty.forEach(f => {
            const emailButtonHtml = f.email !== 'N/A' ? `
                <div class="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <button data-faculty-name="${f.name}" data-faculty-email="${f.email}" class="compose-email-btn w-full text-center bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--accent-color)] hover:text-white transition-colors duration-300 text-sm">
                        Compose Email
                    </button>
                </div>
            ` : '';

            container.innerHTML += `
                <div class="bg-[var(--card-bg)] rounded-lg p-5 shadow-md border border-[var(--border-color)] flex flex-col">
                    <h3 class="text-xl font-bold text-[var(--header-text)]">${f.name}</h3>
                    <p class="text-[var(--accent-color)] font-semibold">${f.subject}</p>
                    <div class="mt-4 space-y-2 text-sm flex-grow">
                        <a href="tel:${f.contact}" class="flex items-center text-[var(--accent-color)] hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            ${f.contact}
                        </a>
                        <p class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                            ${f.cabin}
                        </p>
                        <a href="${f.email !== 'N/A' ? 'mailto:' + f.email : '#'}" class="flex items-center ${f.email !== 'N/A' ? 'hover:underline text-[var(--accent-color)]' : 'cursor-default'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            ${f.email}
                        </a>
                    </div>
                    ${emailButtonHtml}
                </div>
            `;
        });
    };

    const renderRestaurantCards = () => {
        const container = document.querySelector('#restaurants-container');
        if (!container) return; 

        container.innerHTML = '';
        restaurants.forEach(r => {
            container.innerHTML += `
                <div class="bg-[var(--card-bg)] rounded-lg p-5 shadow-md border border-[var(--border-color)]">
                    <h3 class="text-xl font-bold text-[var(--header-text)]">${r.name}</h3>
                    <div class="mt-2 text-sm">
                        <a href="tel:${r.contact}" class="flex items-center text-[var(--accent-color)] hover:underline">
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
             container.innerHTML = `<div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert"><p>Supabase client not initialized.</p></div>`;
            return;
        };
        
        container.innerHTML = `<div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)]"><p class="text-sm text-gray-500 dark:text-gray-400">Loading...</p></div>`;

        const handleUpdates = (data) => {
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="bg-[var(--card-bg)] rounded-lg p-4 text-center border border-[var(--border-color)] flex items-center justify-center h-48">
                        <h2 class="text-2xl font-bold text-[var(--accent-color)] opacity-75">No Announcement</h2>
                    </div>`;
                return;
            }
            
            container.innerHTML = '';
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(ann => {
                const postTime = timeAgo(ann.created_at);
                container.innerHTML += `
                    <div class="bg-[var(--card-bg)] rounded-lg p-4 shadow-sm border border-[var(--border-color)] flex items-start space-x-3">
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
        
        const { data, error } = await supabaseClient.from('announcements').select('*');
        if (error) {
               console.error("Supabase error:", error);
               container.innerHTML = `<div class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert"><p>Could not load announcements. Check RLS policies.</p></div>`;
        } else {
               handleUpdates(data);
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
            placeholder.innerHTML = `<h2 class="text-2xl font-bold text-red-500">Error: Supabase Not Ready</h2>`;
            return;
        }
    
        const BUCKET_NAME = 'gallery-images'; 
    
        try {
            const { data: files, error } = await supabaseClient
                .storage
                .from(BUCKET_NAME)
                .list('', { sortBy: { column: 'created_at', order: 'desc' } });
    
            if (error) throw error;
            
            const imageFiles = files.filter(file => {
                const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
                return allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
            });
    
            if (!imageFiles || imageFiles.length === 0) {
                container.classList.add('hidden');
                placeholder.classList.remove('hidden');
                return; 
            }
    
            placeholder.classList.add('hidden');
            container.classList.remove('hidden');
            container.innerHTML = ''; 

            const imageUrls = [];
            let currentIndex = 0;

            imageFiles.forEach((file, index) => {
                const { data: publicUrlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(file.name);
                
                if (publicUrlData.publicUrl) {
                    imageUrls.push(publicUrlData.publicUrl);

                    const imageElement = document.createElement('div');
                    imageElement.className = 'bg-[var(--card-bg)] rounded-lg shadow-md overflow-hidden border border-[var(--border-color)]';
                    imageElement.innerHTML = `
                        <img src="${publicUrlData.publicUrl}" alt="Gallery thumbnail" class="w-full h-48 object-contain transition-transform duration-300 cursor-pointer">
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
    
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            placeholder.classList.remove('hidden');
            container.classList.add('hidden');
            placeholder.innerHTML = `<h2 class="text-2xl font-bold text-red-500">Could not load images</h2>`;
        }
    };

    // --- GEMINI API FEATURES ---
    const callGeminiAPI = async (userQuery, systemPrompt, retries = 3, delay = 1000) => {
        const supabaseFunctionUrl = 'https://syvpeftawfakdiebueji.supabase.co/functions/v1/call-gemini';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dnBlZnRhd2Zha2RpZWJ1ZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjMyNDcsImV4cCI6MjA3NTU5OTI0N30.RSR3fp-ooPgSxwCKmMb-Xt2pTrb2cO8w5VJg9bZxaiY';
        const payload = { userQuery, systemPrompt };

        try {
            const response = await fetch(supabaseFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey, 
                    'Authorization': `Bearer ${supabaseAnonKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 429 && retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return callGeminiAPI(userQuery, systemPrompt, retries - 1, delay * 2);
                }
                const errorData = await response.json();
                throw new Error(`API request failed with status ${response.status}: ${errorData.error || 'Unknown error'}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else if (result.error) {
                 throw new Error(`Error from Supabase Function: ${result.error}`);
            }
            else {
                if(result.error && result.error.message) {
                    throw new Error(`Error from Gemini API: ${result.error.message}`);
                }
                throw new Error("Invalid response structure from API.");
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
                    <div class="flex items-start gap-3 justify-end">
                        <div class="bg-blue-600 text-white p-3 rounded-lg">
                            <p class="text-sm">${message}</p>
                        </div>
                        <span class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center font-bold">You</span>
                    </div>
                `;
            } else { // AI
                content = `
                    <div class="flex items-start gap-3">
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
            const aiResponse = await callGeminiAPI(userQuery, systemPrompt);

            addMessageToChat(aiResponse, 'ai');
            chatLoader.classList.add('hidden');
            sendChatBtn.disabled = false;
            chatInput.focus();
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
            modalEmailFrom.value = localStorage.getItem('userName') || '';
            modalEmailRegNo.value = localStorage.getItem('userRegNo') || '';
            modalEmailSubject.value = '';
            modalEmailPrompt.value = '';
            modalEmailBody.value = '';
            modalEmailLoader.classList.add('hidden');
            modalGenerateEmailBtn.disabled = false;
            copyConfirm.classList.add('hidden');
            emailModal.classList.remove('hidden');
            emailModal.classList.add('active');
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

            const aiResponse = await callGeminiAPI(fullPrompt, systemPrompt);

            modalEmailBody.value = aiResponse;
            modalEmailLoader.classList.add('hidden');
            modalGenerateEmailBtn.disabled = false;
        });
        
        copyEmailBtn.addEventListener('click', () => {
            if(modalEmailBody.value) {
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

    // --- Initial Renders based on page ---
    renderDeadlineCards();
    renderFacultyCards();
    renderRestaurantCards();
    renderAnnouncements();
    renderGalleryImages();
});

