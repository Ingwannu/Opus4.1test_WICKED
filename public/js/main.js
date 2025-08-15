// API Configuration
const API_BASE_URL = '/api';

// Token Management
const TokenManager = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
  },
  
  isAuthenticated() {
    return !!this.getToken();
  }
};

// User Management
const UserManager = {
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  removeUser() {
    localStorage.removeItem('user');
  },
  
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'OWNER' || user.role === 'ADMIN');
  }
};

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const token = TokenManager.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// UI Helpers
function showAlert(message, type = 'info', duration = 5000) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-4 text-xl">&times;</button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  if (duration > 0) {
    setTimeout(() => {
      alertDiv.remove();
    }, duration);
  }
}

function showLoading(element) {
  element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(element, content = '') {
  element.innerHTML = content;
}

// Update UI based on auth state
function updateAuthUI() {
  const isAuthenticated = TokenManager.isAuthenticated();
  const user = UserManager.getUser();
  
  const authButtons = document.getElementById('auth-buttons');
  const profileBtn = document.getElementById('profile-btn');
  const adminBtn = document.getElementById('admin-btn');
  
  if (isAuthenticated && user) {
    if (authButtons) authButtons.classList.add('hidden');
    
    if (profileBtn) {
      profileBtn.classList.remove('hidden');
      profileBtn.innerHTML = `<a href="/profile" class="nav-link">${user.username}</a>`;
    }
    
    if (adminBtn && UserManager.isAdmin()) {
      adminBtn.classList.remove('hidden');
    }
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (profileBtn) profileBtn.classList.add('hidden');
    if (adminBtn) adminBtn.classList.add('hidden');
  }
}

// Logout function
async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    TokenManager.removeToken();
    UserManager.removeUser();
    window.location.href = '/';
  }
}

// Navigation Effects
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  // Scroll effect
  if (navbar) {
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  }
  
  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
    
    // Close menu when clicking on a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  initNavigation();
  
  // Add fade-in animations to elements as they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
});

// Export for use in other scripts
window.TokenManager = TokenManager;
window.UserManager = UserManager;
window.apiRequest = apiRequest;
window.showAlert = showAlert;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.logout = logout;