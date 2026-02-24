const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptContent = fs.readFileSync('script.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Mock dependencies
window.IntersectionObserver = class { observe() { } unobserve() { } };
window.localStorage = { getItem: () => null, setItem: () => { } };
window.supabase = {
    createClient: () => ({
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => { },
            signOut: () => Promise.resolve()
        },
        channel: () => ({ on: () => ({ on: () => ({ on: () => ({ subscribe: () => { } }) }) }) }),
        from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
        storage: { from: () => ({ list: () => Promise.resolve({ data: [] }), getPublicUrl: () => ({}) }) }
    })
};

// Catch errors
window.console.error = (msg, e) => {
    console.error("DOM ERROR:", msg, e);
};
window.addEventListener('error', (event) => {
    console.log('Uncaught Error:', event.error);
});

try {
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.document.body.appendChild(scriptEl);
} catch (e) {
    console.log("Script evaluation error:", e);
}

setTimeout(() => {
    const btn = window.document.getElementById('profile-btn');
    if (!btn) {
        console.log("Error: Profile button not found.");
        return;
    }
    const dropdown = window.document.getElementById('profile-dropdown');
    console.log("Before click: dropdown hidden class =", dropdown.className.includes('hidden'));

    // Simulate click
    btn.click();
    console.log("After click: dropdown hidden class =", dropdown.className.includes('hidden'));

}, 1000);
