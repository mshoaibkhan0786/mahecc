document.addEventListener('DOMContentLoaded', () => {
    // --- THEME (DARK/LIGHT) SETUP ---
    const themeBtn = document.querySelector('.theme-switcher-btn');
    const iconSun = document.querySelector('.theme-icon-sun');
    const iconMoon = document.querySelector('.theme-icon-moon');

    const applyTheme = (theme) => {
        const htmlEl = document.documentElement; // <html>
        if (theme === 'dark') {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
            if (iconSun) iconSun.classList.add('hidden');
            if (iconMoon) iconMoon.classList.remove('hidden');
        } else {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
            if (iconSun) iconSun.classList.remove('hidden');
            if (iconMoon) iconMoon.classList.add('hidden');
        }
    };

    // Determine initial theme: localStorage -> prefers-color-scheme -> default light
    try {
        const saved = localStorage.getItem('site-theme');
        if (saved === 'dark' || saved === 'light') {
            applyTheme(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    } catch (e) {
        // If localStorage is unavailable, fallback to prefers-color-scheme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const htmlEl = document.documentElement;
            const isDark = htmlEl.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            try { localStorage.setItem('site-theme', newTheme); } catch (e) { /* ignore */ }
        });
    }

    // --- SUPABASE SETUP ---
    const SUPABASE_URL = 'https://syvpeftawfakdiebueji.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dnBlZnRhd2Zha2RpZWJ1ZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjMyNDcsImV4cCI6MjA3NTU5OTI0N30.RSR3fp-ooPgSxwCKmMb-Xt2pTrb2cO8w5VJg9bZxaiY';

    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    // --- DOM ELEMENTS ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const authMessage = document.getElementById('auth-message');

    // --- HELPER FUNCTION FOR DISPLAYING MESSAGES ---
    const showMessage = (message, isError = false) => {
        authMessage.textContent = message;
        authMessage.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        if (isError) {
            authMessage.classList.add('bg-red-100', 'text-red-700');
        } else {
            authMessage.classList.add('bg-green-100', 'text-green-700');
        }
        setTimeout(() => {
            authMessage.classList.add('hidden');
        }, 5000);
    };

    // --- SIGN UP HANDLER ---
    if(signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const phone = document.getElementById('signup-phone').value;
    
            const { data, error } = await _supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone, 
                    }
                }
            });
    
            if (error) {
                if (error.message.includes("User already registered")) {
                    showMessage("This email is already in use. Please try logging in.", true);
                } else {
                    showMessage(`Error: ${error.message}`, true);
                }
            } else if (data.user) {
                 if (data.user.identities && data.user.identities.length === 0 && data.user.created_at !== data.user.updated_at) {
                    showMessage("This email is already in use with a social provider (like Google). Please sign in that way.", true);
                } else {
                    showMessage('Sign up successful! Please check your email to verify your account.');
                }
            }
        });
    }


    // --- LOGIN HANDLER ---
    if(loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
    
            const { data, error } = await _supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
    
            if (error) {
                showMessage(`Error: ${error.message}`, true);
            } else if (data.user) {
                showMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);
            }
        });
    }


    // --- GOOGLE OAUTH HANDLER ---
    if(googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                const redirectTo = window.location.origin + '/';
                const { error } = await _supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo }
                });

                if (error) throw error;
            } catch (err) {
                showMessage(`Error: ${err?.message || err}`, true);
            }
        });
    }


    // --- SESSION CHECK ---
    (async () => {
        try {
            const { data: { session } } = await _supabase.auth.getSession();
            if (session) {
                window.location.href = "/";
            }
        } catch (e) {
            console.error("Error checking session:", e);
        }
    })();
});

