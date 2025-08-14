// API configuration
const API_CONFIG = {
    getBaseUrl: function() {
        // Use the current protocol and host
        const protocol = window.location.protocol;
        const host = window.location.host;
        return `${protocol}//${host}`;
    }
};

// API helper functions
async function apiCall(endpoint, options = {}) {
    const baseUrl = API_CONFIG.getBaseUrl();
    const url = `${baseUrl}/api${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'API call failed');
    }
    
    return response.json();
}