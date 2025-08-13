// Admin Panel JavaScript
const { $, $$, showAlert, showLoading, formatDate, formatCurrency, createElement } = Utils;
const { request } = API;
const { UserManager } = Auth;

// Current state
let currentSection = 'dashboard';
let currentBotId = null;
let currentCategoryId = null;
let currentProductId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Check admin permission
    if (!UserManager.isAdmin()) {
        window.location.href = '/';
        return;
    }
    
    // Initialize sidebar navigation
    initSidebar();
    
    // Initialize tabs
    initTabs();
    
    // Load dashboard
    loadDashboard();
    
    // Initialize mobile menu
    $('#admin-menu-toggle').addEventListener('click', () => {
        $('#admin-sidebar').classList.toggle('active');
    });
    
    // Initialize forms
    initForms();
    
    // Initialize markdown editors
    initMarkdownEditors();
});

// Sidebar navigation
function initSidebar() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            
            // Update active state
            $$('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Close mobile sidebar
            $('#admin-sidebar').classList.remove('active');
        });
    });
}

// Show section
function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    $$('.admin-section').forEach(sec => sec.classList.add('hidden'));
    
    // Show selected section
    $(`#${section}`).classList.remove('hidden');
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'bots':
            loadBots();
            break;
        case 'hosting':
            loadCategories();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const data = await request('/admin/dashboard');
        const { stats, recentLogins } = data;
        
        // Update stats
        $('#total-users').textContent = stats.totalUsers;
        $('#active-users').textContent = stats.activeUsers;
        $('#total-bots').textContent = stats.totalBots;
        $('#total-products').textContent = stats.totalProducts;
        
        // Update recent logins
        if (recentLogins.length > 0) {
            $('#recent-logins').innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>사용자</th>
                            <th>이메일</th>
                            <th>역할</th>
                            <th>마지막 로그인</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentLogins.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${getRoleBadge(user.role)}</td>
                                <td>${formatDate(user.last_login)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            $('#recent-logins').innerHTML = '<p class="text-center">최근 로그인 기록이 없습니다.</p>';
        }
    } catch (error) {
        showAlert('대시보드를 불러오는데 실패했습니다.', 'error');
    }
}

// User management functions
async function loadUsers(page = 1) {
    const container = $('#users-table');
    showLoading(container);
    
    try {
        const search = $('#user-search').value;
        const role = $('#user-role-filter').value;
        const status = $('#user-status-filter').value;
        
        const params = new URLSearchParams({
            page,
            search,
            role,
            status
        });
        
        const data = await request(`/admin/users?${params}`);
        const { users, pagination } = data;
        
        if (users.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>아이디</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>역할</th>
                            <th>상태</th>
                            <th>가입일</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${user.phone}</td>
                                <td>${getRoleBadge(user.role)}</td>
                                <td>${getStatusBadge(user.status)}</td>
                                <td>${formatDate(user.created_at)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn action-btn" onclick="viewUser('${user.id}')">보기</button>
                                        ${canManageUser(user) ? `
                                            <button class="btn btn-secondary action-btn" onclick="editUser('${user.id}')">수정</button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${renderPagination(pagination, loadUsers)}
            `;
        } else {
            container.innerHTML = '<p class="text-center">사용자가 없습니다.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">사용자를 불러오는데 실패했습니다.</p>';
    }
}

// View user details
async function viewUser(userId) {
    try {
        const data = await request(`/admin/users/${userId}`);
        const { user } = data;
        
        $('#user-modal-title').textContent = '사용자 정보';
        $('#user-modal-body').innerHTML = `
            <div class="mb-3">
                <strong>아이디:</strong> ${user.username}
            </div>
            <div class="mb-3">
                <strong>이메일:</strong> ${user.email}
            </div>
            <div class="mb-3">
                <strong>전화번호:</strong> ${user.phone}
            </div>
            <div class="mb-3">
                <strong>역할:</strong> ${getRoleBadge(user.role)}
            </div>
            <div class="mb-3">
                <strong>상태:</strong> ${getStatusBadge(user.status)}
            </div>
            <div class="mb-3">
                <strong>가입일:</strong> ${formatDate(user.created_at)}
            </div>
            <div class="mb-3">
                <strong>마지막 로그인:</strong> ${user.last_login ? formatDate(user.last_login) : '없음'}
            </div>
        `;
        
        const actions = [];
        if (canManageUser(user)) {
            if (user.status === 'ACTIVE') {
                actions.push(`<button class="btn btn-warning" onclick="changeUserStatus('${userId}', 'SUSPENDED')">계정 정지</button>`);
            } else if (user.status === 'SUSPENDED') {
                actions.push(`<button class="btn btn-success" onclick="changeUserStatus('${userId}', 'ACTIVE')">계정 활성화</button>`);
            }
            actions.push(`<button class="btn btn-secondary" onclick="resetUserPassword('${userId}')">비밀번호 초기화</button>`);
            
            if (UserManager.getUser().role === 'OWNER' && user.role !== 'OWNER') {
                actions.push(`<button class="btn btn-primary" onclick="changeUserRole('${userId}')">역할 변경</button>`);
            }
        }
        
        $('#user-modal-actions').innerHTML = actions.join(' ');
        openModal('user-modal');
    } catch (error) {
        showAlert('사용자 정보를 불러오는데 실패했습니다.', 'error');
    }
}

// Change user status
async function changeUserStatus(userId, status) {
    if (!confirm(`정말 이 사용자의 상태를 변경하시겠습니까?`)) return;
    
    try {
        await request(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: { status }
        });
        
        showAlert('사용자 상태가 변경되었습니다.', 'success');
        closeModal('user-modal');
        loadUsers();
    } catch (error) {
        showAlert('상태 변경에 실패했습니다.', 'error');
    }
}

// Reset user password
async function resetUserPassword(userId) {
    if (!confirm('정말 이 사용자의 비밀번호를 초기화하시겠습니까?')) return;
    
    try {
        const data = await request(`/admin/users/${userId}/reset-password`, {
            method: 'POST'
        });
        
        showAlert(`임시 비밀번호: ${data.tempPassword}`, 'success');
    } catch (error) {
        showAlert('비밀번호 초기화에 실패했습니다.', 'error');
    }
}

// Discord bot management
async function loadBots() {
    const container = $('#bots-list');
    showLoading(container);
    
    try {
        const data = await request('/bots');
        const { bots } = data;
        
        if (bots.length > 0) {
            container.innerHTML = `
                <div class="grid grid-cols-3 gap-4">
                    ${bots.map(bot => `
                        <div class="glass-card">
                            ${bot.image_path ? `<img src="${bot.image_path}" alt="${bot.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-sm); margin-bottom: var(--spacing-md);">` : ''}
                            <h4>${bot.name}</h4>
                            <p>${bot.short_description}</p>
                            <div class="mt-3">
                                <span class="${bot.status === 'ACTIVE' ? 'status-badge active' : 'status-badge suspended'}">
                                    ${bot.status === 'ACTIVE' ? '활성' : '비활성'}
                                </span>
                            </div>
                            <div class="action-buttons mt-3">
                                <button class="btn btn-secondary" onclick="editBot('${bot.id}')">수정</button>
                                <button class="btn btn-danger" onclick="deleteBot('${bot.id}')">삭제</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">등록된 봇이 없습니다.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">봇 목록을 불러오는데 실패했습니다.</p>';
    }
}

// Open bot modal
function openBotModal(botId = null) {
    currentBotId = botId;
    const form = $('#bot-form');
    form.reset();
    
    if (botId) {
        $('#bot-modal-title').textContent = '봇 수정';
        // Load bot data
        loadBotData(botId);
    } else {
        $('#bot-modal-title').textContent = '새 봇 추가';
    }
    
    openModal('bot-modal');
}

// Edit bot
async function editBot(botId) {
    openBotModal(botId);
}

// Delete bot
async function deleteBot(botId) {
    if (!confirm('정말 이 봇을 삭제하시겠습니까?')) return;
    
    try {
        await request(`/bots/${botId}`, { method: 'DELETE' });
        showAlert('봇이 삭제되었습니다.', 'success');
        loadBots();
    } catch (error) {
        showAlert('봇 삭제에 실패했습니다.', 'error');
    }
}

// Hosting management
async function loadCategories() {
    const container = $('#categories-list');
    showLoading(container);
    
    try {
        const data = await request('/hosting/categories');
        const { categories } = data;
        
        if (categories.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>카테고리명</th>
                            <th>설명</th>
                            <th>상품 수</th>
                            <th>순서</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat => `
                            <tr>
                                <td>${cat.name}</td>
                                <td>${cat.description || '-'}</td>
                                <td>${cat.productCount}</td>
                                <td>${cat.order}</td>
                                <td>${getStatusBadge(cat.status)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-secondary action-btn" onclick="editCategory('${cat.id}')">수정</button>
                                        <button class="btn btn-danger action-btn" onclick="deleteCategory('${cat.id}')">삭제</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<p class="text-center">카테고리가 없습니다.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">카테고리를 불러오는데 실패했습니다.</p>';
    }
}

// Load products
async function loadProducts() {
    const container = $('#products-list');
    showLoading(container);
    
    try {
        const data = await request('/hosting/products');
        const { products } = data;
        
        if (products.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>상품명</th>
                            <th>카테고리</th>
                            <th>가격</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category.name}</td>
                                <td>${formatCurrency(product.price)}</td>
                                <td>${getProductStatusBadge(product.status)}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-secondary action-btn" onclick="editProduct('${product.id}')">수정</button>
                                        <button class="btn btn-danger action-btn" onclick="deleteProduct('${product.id}')">삭제</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<p class="text-center">상품이 없습니다.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">상품을 불러오는데 실패했습니다.</p>';
    }
}

// Activity logs
async function loadLogs(page = 1) {
    const container = $('#logs-table');
    showLoading(container);
    
    try {
        const params = new URLSearchParams({ page });
        const data = await request(`/admin/logs?${params}`);
        const { logs, pagination } = data;
        
        if (logs.length > 0) {
            container.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>시간</th>
                            <th>관리자</th>
                            <th>작업</th>
                            <th>대상</th>
                            <th>IP</th>
                            ${UserManager.getUser().role === 'OWNER' ? '<th>삭제</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr class="log-entry">
                                <td>${formatDate(log.created_at)}</td>
                                <td>${log.admin.username}</td>
                                <td class="log-action">${getActionName(log.action_type)}</td>
                                <td>${log.targetUser ? log.targetUser.username : '-'}</td>
                                <td>${log.ip_address || '-'}</td>
                                ${UserManager.getUser().role === 'OWNER' ? `
                                    <td>
                                        <button class="btn btn-danger action-btn" onclick="deleteLog('${log.id}')">삭제</button>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${renderPagination(pagination, loadLogs)}
            `;
        } else {
            container.innerHTML = '<p class="text-center">활동 로그가 없습니다.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="text-center text-error">로그를 불러오는데 실패했습니다.</p>';
    }
}

// Delete log (Owner only)
async function deleteLog(logId) {
    if (!confirm('정말 이 로그를 삭제하시겠습니까?')) return;
    
    try {
        await request(`/admin/logs/${logId}`, { method: 'DELETE' });
        showAlert('로그가 삭제되었습니다.', 'success');
        loadLogs();
    } catch (error) {
        showAlert('로그 삭제에 실패했습니다.', 'error');
    }
}

// Helper functions
function getRoleBadge(role) {
    const roleNames = {
        'OWNER': '오너',
        'ADMIN': '관리자',
        'ULTRA': '울트라',
        'PRO': '프로',
        'FREE': '무료'
    };
    return `<span class="role-badge ${role.toLowerCase()}">${roleNames[role]}</span>`;
}

function getStatusBadge(status) {
    const statusNames = {
        'ACTIVE': '활성',
        'SUSPENDED': '정지',
        'DELETED': '삭제됨',
        'INACTIVE': '비활성'
    };
    return `<span class="status-badge ${status.toLowerCase()}">${statusNames[status]}</span>`;
}

function getProductStatusBadge(status) {
    const statusNames = {
        'AVAILABLE': '판매중',
        'OUT_OF_STOCK': '품절',
        'HIDDEN': '숨김'
    };
    const statusClasses = {
        'AVAILABLE': 'active',
        'OUT_OF_STOCK': 'suspended',
        'HIDDEN': 'deleted'
    };
    return `<span class="status-badge ${statusClasses[status]}">${statusNames[status]}</span>`;
}

function getActionName(action) {
    const actionNames = {
        'USER_CREATE': '사용자 생성',
        'USER_UPDATE': '사용자 수정',
        'USER_DELETE': '사용자 삭제',
        'USER_SUSPEND': '계정 정지',
        'USER_ACTIVATE': '계정 활성화',
        'ROLE_CHANGE': '역할 변경',
        'PASSWORD_RESET': '비밀번호 초기화',
        'FORCE_LOGOUT': '강제 로그아웃',
        'BOT_CREATE': '봇 생성',
        'BOT_UPDATE': '봇 수정',
        'BOT_DELETE': '봇 삭제',
        'PRODUCT_CREATE': '상품 생성',
        'PRODUCT_UPDATE': '상품 수정',
        'PRODUCT_DELETE': '상품 삭제',
        'CATEGORY_CREATE': '카테고리 생성',
        'CATEGORY_UPDATE': '카테고리 수정',
        'CATEGORY_DELETE': '카테고리 삭제'
    };
    return actionNames[action] || action;
}

function canManageUser(user) {
    const currentUser = UserManager.getUser();
    if (currentUser.role === 'OWNER') return true;
    if (currentUser.role === 'ADMIN') {
        return user.role !== 'OWNER' && user.role !== 'ADMIN';
    }
    return false;
}

function renderPagination(pagination, loadFunction) {
    if (pagination.pages <= 1) return '';
    
    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            pages.push(`<span class="btn btn-primary">${i}</span>`);
        } else {
            pages.push(`<button class="btn btn-secondary" onclick="${loadFunction.name}(${i})">${i}</button>`);
        }
    }
    
    return `
        <div class="flex justify-center gap-2 mt-4">
            ${pages.join('')}
        </div>
    `;
}

// Modal functions
function openModal(modalId) {
    $(`#${modalId}`).classList.add('active');
}

function closeModal(modalId) {
    $(`#${modalId}`).classList.remove('active');
}

window.closeModal = closeModal;
window.openBotModal = openBotModal;
window.openCategoryModal = openCategoryModal;
window.openProductModal = openProductModal;
window.viewUser = viewUser;
window.editUser = editUser;
window.changeUserStatus = changeUserStatus;
window.resetUserPassword = resetUserPassword;
window.changeUserRole = changeUserRole;
window.editBot = editBot;
window.deleteBot = deleteBot;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteLog = deleteLog;
window.loadUsers = loadUsers;

// Category modal functions
function openCategoryModal(categoryId = null) {
    currentCategoryId = categoryId;
    const form = $('#category-form');
    form.reset();
    
    if (categoryId) {
        $('#category-modal-title').textContent = '카테고리 수정';
        // Load category data
        loadCategoryData(categoryId);
    } else {
        $('#category-modal-title').textContent = '새 카테고리 추가';
    }
    
    openModal('category-modal');
}

async function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까? 모든 상품도 함께 삭제됩니다.')) return;
    
    try {
        await request(`/hosting/categories/${categoryId}`, { method: 'DELETE' });
        showAlert('카테고리가 삭제되었습니다.', 'success');
        loadCategories();
    } catch (error) {
        showAlert('카테고리 삭제에 실패했습니다.', 'error');
    }
}

// Product modal functions
async function openProductModal(productId = null) {
    currentProductId = productId;
    const form = $('#product-form');
    form.reset();
    
    // Load categories for select
    try {
        const data = await request('/hosting/categories');
        const select = $('#product-category');
        select.innerHTML = data.categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    } catch (error) {
        showAlert('카테고리를 불러오는데 실패했습니다.', 'error');
        return;
    }
    
    if (productId) {
        $('#product-modal-title').textContent = '상품 수정';
        // Load product data
        loadProductData(productId);
    } else {
        $('#product-modal-title').textContent = '새 상품 추가';
    }
    
    openModal('product-modal');
}

async function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
        await request(`/hosting/products/${productId}`, { method: 'DELETE' });
        showAlert('상품이 삭제되었습니다.', 'success');
        loadProducts();
    } catch (error) {
        showAlert('상품 삭제에 실패했습니다.', 'error');
    }
}

// Initialize tabs
function initTabs() {
    $$('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            
            // Update active tab
            $$('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide content
            $$('.tab-content').forEach(content => content.classList.add('hidden'));
            $(`#${tabName}-tab`).classList.remove('hidden');
            
            // Load data
            if (tabName === 'categories') {
                loadCategories();
            } else if (tabName === 'products') {
                loadProducts();
            }
        });
    });
}

// Initialize forms
function initForms() {
    // Bot form
    $('#bot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            if (currentBotId) {
                await request(`/bots/${currentBotId}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {}
                });
                showAlert('봇이 수정되었습니다.', 'success');
            } else {
                await request('/bots', {
                    method: 'POST',
                    body: formData,
                    headers: {}
                });
                showAlert('봇이 추가되었습니다.', 'success');
            }
            
            closeModal('bot-modal');
            loadBots();
        } catch (error) {
            showAlert(error.message || '저장에 실패했습니다.', 'error');
        }
    });
    
    // Category form
    $('#category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            if (currentCategoryId) {
                await request(`/hosting/categories/${currentCategoryId}`, {
                    method: 'PUT',
                    body: data
                });
                showAlert('카테고리가 수정되었습니다.', 'success');
            } else {
                await request('/hosting/categories', {
                    method: 'POST',
                    body: data
                });
                showAlert('카테고리가 추가되었습니다.', 'success');
            }
            
            closeModal('category-modal');
            loadCategories();
        } catch (error) {
            showAlert(error.message || '저장에 실패했습니다.', 'error');
        }
    });
    
    // Product form
    $('#product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            if (currentProductId) {
                await request(`/hosting/products/${currentProductId}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {}
                });
                showAlert('상품이 수정되었습니다.', 'success');
            } else {
                await request('/hosting/products', {
                    method: 'POST',
                    body: formData,
                    headers: {}
                });
                showAlert('상품이 추가되었습니다.', 'success');
            }
            
            closeModal('product-modal');
            loadProducts();
        } catch (error) {
            showAlert(error.message || '저장에 실패했습니다.', 'error');
        }
    });
}

// Initialize markdown editors
function initMarkdownEditors() {
    // Bot description
    $('#bot-description').addEventListener('input', (e) => {
        $('#bot-preview').innerHTML = marked.parse(e.target.value || '');
    });
    
    // Product description
    $('#product-description').addEventListener('input', (e) => {
        $('#product-preview').innerHTML = marked.parse(e.target.value || '');
    });
}

// Load marked library for markdown parsing
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(script);