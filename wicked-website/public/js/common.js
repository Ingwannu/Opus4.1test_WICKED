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
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      TokenManager.removeToken();
      UserManager.removeUser();
      window.location.href = '/login';
      return;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// DOM Utilities
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) element.textContent = content;
  return element;
}

// Show/Hide Loading
function showLoading(container) {
  const spinner = createElement('div', 'spinner');
  const wrapper = createElement('div', 'flex justify-center items-center');
  wrapper.appendChild(spinner);
  container.innerHTML = '';
  container.appendChild(wrapper);
}

function hideLoading(container) {
  const spinner = container.querySelector('.spinner');
  if (spinner) {
    spinner.parentElement.remove();
  }
}

// Show Alert
function showAlert(message, type = 'info') {
  const alertClass = `alert alert-${type}`;
  const alert = createElement('div', alertClass);
  alert.innerHTML = `
    <div class="glass-container fade-in" style="background: ${
      type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
      type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
      'rgba(33, 150, 243, 0.1)'
    }; margin-bottom: var(--spacing-lg);">
      <p style="margin: 0; color: var(--text-primary);">${message}</p>
    </div>
  `;
  
  const container = $('#alert-container') || document.body;
  container.insertBefore(alert, container.firstChild);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Form Validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10,15}$/.test(phone);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_-]{3,50}$/.test(username);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Button Ripple Effect
function addRippleEffect(button) {
  button.addEventListener('click', function(e) {
    this.classList.add('clicked');
    setTimeout(() => {
      this.classList.remove('clicked');
    }, 600);
  });
}

// Navbar Scroll Effect
function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle
  const menuToggle = $('.mobile-menu-toggle');
  const navMenu = $('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

// Update Navigation Based on Auth
function updateNavigation() {
  const user = UserManager.getUser();
  const isAuthenticated = TokenManager.isAuthenticated();
  const isAdmin = UserManager.isAdmin();
  
  const profileBtn = $('#profile-btn');
  const adminBtn = $('#admin-btn');
  const authBtns = $('#auth-buttons');
  
  if (isAuthenticated && user) {
    if (profileBtn) {
      profileBtn.classList.remove('hidden');
      profileBtn.innerHTML = `
        <a href="/profile" class="nav-link">
          <span>${user.username}</span>
        </a>
      `;
    }
    
    if (isAdmin && adminBtn) {
      adminBtn.classList.remove('hidden');
    }
    
    if (authBtns) {
      authBtns.classList.add('hidden');
    }
  } else {
    if (profileBtn) {
      profileBtn.classList.add('hidden');
    }
    
    if (adminBtn) {
      adminBtn.classList.add('hidden');
    }
    
    if (authBtns) {
      authBtns.classList.remove('hidden');
    }
  }
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
}

// Initialize Common Features
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navbar
  initNavbar();
  
  // Update navigation
  updateNavigation();
  
  // Add ripple effect to all buttons
  $$('.btn').forEach(addRippleEffect);
  
  // Check authentication on protected pages
  const protectedPages = ['/profile', '/admin'];
  const currentPath = window.location.pathname;
  
  if (protectedPages.includes(currentPath) && !TokenManager.isAuthenticated()) {
    window.location.href = '/login';
  }
  
  if (currentPath === '/admin' && !UserManager.isAdmin()) {
    window.location.href = '/';
  }
});

// Export utilities
window.API = {
  request: apiRequest
};

window.Utils = {
  $,
  $$,
  createElement,
  showLoading,
  hideLoading,
  showAlert,
  formatDate,
  formatCurrency
};

window.Auth = {
  TokenManager,
  UserManager
};