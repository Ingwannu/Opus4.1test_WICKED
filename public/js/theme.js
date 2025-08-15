// Theme System
(function() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const systemIcon = document.querySelector('.system-icon');
    
    // Theme values
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    };
    
    // Get saved theme or default to light
    let currentTheme = localStorage.getItem('theme') || THEMES.LIGHT;
    
    // Apply theme
    function applyTheme(theme) {
        if (theme === THEMES.SYSTEM) {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', THEMES.SYSTEM);
            updateIcons(THEMES.SYSTEM);
        } else {
            html.setAttribute('data-theme', theme);
            updateIcons(theme);
        }
        
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }
    
    // Update icon visibility
    function updateIcons(theme) {
        sunIcon.classList.toggle('hidden', theme !== THEMES.LIGHT);
        moonIcon.classList.toggle('hidden', theme !== THEMES.DARK);
        systemIcon.classList.toggle('hidden', theme !== THEMES.SYSTEM);
    }
    
    // Cycle through themes
    function cycleTheme() {
        switch (currentTheme) {
            case THEMES.LIGHT:
                applyTheme(THEMES.DARK);
                break;
            case THEMES.DARK:
                applyTheme(THEMES.SYSTEM);
                break;
            case THEMES.SYSTEM:
                applyTheme(THEMES.LIGHT);
                break;
        }
    }
    
    // Initialize theme
    applyTheme(currentTheme);
    
    // Add click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', cycleTheme);
    }
    
    // Listen for system theme changes when in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (currentTheme === THEMES.SYSTEM) {
            applyTheme(THEMES.SYSTEM);
        }
    });
    
    // Add smooth transition after initial load
    setTimeout(() => {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, 100);
})();