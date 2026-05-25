// Simple scroll handler using CSS variables
window.addEventListener('scroll', function() {
    const root = document.documentElement;
    if (window.scrollY > 50) {
        root.style.setProperty('--navbar-shadow', '0 2px 8px rgba(0,0,0,0.1)');
    } else {
        root.style.setProperty('--navbar-shadow', 'none');
    }
});
