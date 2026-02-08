const API_URL = '/api';

let categories = [];
let transactions = [];
let currentView = 'dashboard';

// Check authentication on page load
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/check`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = '/login.html';
            return false;
        }

        // Set username in header
        document.getElementById('username-display').textContent = `Logged in as: ${data.username}`;
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Logout handler
async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return; // Stop initialization if not authenticated
    }

    // Set up logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Continue with normal initialization
    initNavigation();
    setDefaultDates();
    loadCategories();
    loadDashboard();
    setupEventListeners();
});

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`${view}-view`).classList.add('active');
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    currentView = view;

    if (view === 'dashboard') {
        loadDashboard();
    } else if (view === 'transactions') {
        loadTransactions();
    } else if (view === 'categories') {
        loadCategoriesList();
    } else if (view === 'budgets') {
        loadBudgetForm();
    }
}

// Set default dates to today
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quick-date').value = today;
    document.getElementById('trans-date').value = today;

    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('budget-month').value = currentMonth;
    document.getElementById('budget-status-month').value = currentMonth;
    document.getElementById('report-month').value = currentMonth;
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        categories = await response.json();
        populateCategorySelects();
    } catch (error) {
        console.error('Error loading categories:', error);
        showMessage('Error loading categories', 'error');
    }
}

function populateCategorySelects() {
    const selects = [
        'quick-category',
        'trans-category',
        'edit-trans-category'
    ];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentType = selectId.includes('quick')
            ? document.getElementById('quick-type').value
            : document.getElementById('trans-type').value;

        updateCategorySelect(select, currentType);
    });

    // Budget category (expenses only)
    const budgetSelect = document.getElementById('budget-category');
    budgetSelect.innerHTML = categories
        .filter(cat => cat.type === 'expense')
        .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
        .join('');
}

function updateCategorySelect(select, type) {
    const filtered = categories.filter(cat => cat.type === type);
    select.innerHTML = filtered
        .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
        .join('');
}

// Event Listeners
function setupEventListeners() {
    // Quick transaction form
    document.getElementById('quick-transaction-form').addEventListener('submit', handleQuickTransaction);
    document.getElementById('quick-type').addEventListener('change', (e) => {
        updateCategorySelect(document.getElementById('quick-category'), e.target.value);
    });

    // Transaction form
    document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);
    document.getElementById('trans-type').addEventListener('change', (e) => {
        updateCategorySelect(document.getElementById('trans-category'), e.target.value);
    });

    // Transaction filters
    document.getElementById('apply-filter').addEventListener('click', loadTransactions);
    document.getElementById('clear-filter').addEventListener('click', clearFilters);

    // Bulk upload
    setupBulkUpload();

    // Category form
    document.getElementById('category-form').addEventListener('submit', handleAddCategory);

    // Budget form
    document.getElementById('budget-form').addEventListener('submit', handleSetBudget);
    document.getElementById('load-budget-status').addEventListener('click', loadBudgetStatus);

    // Reports
    document.getElementById('load-report').addEventListener('click', loadReport);

    // Edit modal
    document.querySelector('.close').addEventListener('click', closeEditModal);
    document.getElementById('edit-transaction-form').addEventListener('submit', handleEditTransaction);
    document.getElementById('edit-trans-type').addEventListener('change', (e) => {
        updateCategorySelect(document.getElementById('edit-trans-category'), e.target.value);
    });
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/reports/balance`);
        const balance = await response.json();

        document.getElementById('current-balance').textContent = formatCurrency(balance.balance);
        document.getElementById('total-income').textContent = formatCurrency(balance.total_income);
        document.getElementById('total-expenses').textContent = formatCurrency(balance.total_expense);

        // Load recent transactions
        const transResponse = await fetch(`${API_URL}/transactions`);
        const allTransactions = await transResponse.json();
        displayRecentTransactions(allTransactions.slice(0, 5));
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showMessage('Error loading dashboard', 'error');
    }
}

function displayRecentTransactions(transactions) {
    const container = document.getElementById('recent-transactions');
    if (transactions.length === 0) {
        container.innerHTML = '<p>No transactions yet.</p>';
        return;
    }

    container.innerHTML = transactions.map(trans => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-category" style="color: ${trans.category_color}">
                    ${trans.category_name}
                </span>
                <span class="transaction-description">${trans.description || 'No description'}</span>
                <span class="transaction-date">${formatDate(trans.date)}</span>
                <span class="transaction-source">${trans.source || 'Unknown'}</span>
            </div>
            <div class="transaction-amount ${trans.type}">
                ${trans.type === 'income' ? '+' : '-'}${formatCurrency(trans.amount)}
            </div>
        </div>
    `).join('');
}

// Transactions
async function handleQuickTransaction(e) {
    e.preventDefault();
    const formData = {
        type: document.getElementById('quick-type').value,
        amount: parseFloat(document.getElementById('quick-amount').value),
        category_id: parseInt(document.getElementById('quick-category').value),
        description: document.getElementById('quick-description').value,
        date: document.getElementById('quick-date').value
    };

    await addTransaction(formData);
    e.target.reset();
    setDefaultDates();
    loadDashboard();
}

async function handleAddTransaction(e) {
    e.preventDefault();
    const formData = {
        type: document.getElementById('trans-type').value,
        amount: parseFloat(document.getElementById('trans-amount').value),
        category_id: parseInt(document.getElementById('trans-category').value),
        description: document.getElementById('trans-description').value,
        date: document.getElementById('trans-date').value
    };

    await addTransaction(formData);
    e.target.reset();
    setDefaultDates();
    loadTransactions();
}

async function addTransaction(data) {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Transaction added successfully', 'success');
        } else {
            throw new Error('Failed to add transaction');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showMessage('Error adding transaction', 'error');
    }
}

async function loadTransactions() {
    try {
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const filterSource = document.getElementById('filter-source').value;

        let url = `${API_URL}/transactions`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(url);
        transactions = await response.json();

        // Populate source filter dropdown with unique sources
        populateSourceFilter(transactions);

        // Apply source filter on client side
        let filteredTransactions = transactions;
        if (filterSource) {
            filteredTransactions = transactions.filter(t => t.source === filterSource);
        }

        displayTransactions(filteredTransactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        showMessage('Error loading transactions', 'error');
    }
}

function populateSourceFilter(transactions) {
    const sourceFilter = document.getElementById('filter-source');
    const currentValue = sourceFilter.value;

    // Get unique sources
    const sources = [...new Set(transactions.map(t => t.source || 'Unknown'))].sort();

    // Keep "All Sources" and add unique sources
    sourceFilter.innerHTML = '<option value="">All Sources</option>' +
        sources.map(source => `<option value="${source}">${source}</option>`).join('');

    // Restore previous selection if it still exists
    if (currentValue && sources.includes(currentValue)) {
        sourceFilter.value = currentValue;
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    if (transactions.length === 0) {
        container.innerHTML = '<p>No transactions found.</p>';
        return;
    }

    container.innerHTML = transactions.map(trans => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-category" style="color: ${trans.category_color}">
                    ${trans.category_name}
                </span>
                <span class="transaction-description">${trans.description || 'No description'}</span>
                <span class="transaction-date">${formatDate(trans.date)}</span>
                <span class="transaction-source">${trans.source || 'Unknown'}</span>
            </div>
            <div class="transaction-amount ${trans.type}">
                ${trans.type === 'income' ? '+' : '-'}${formatCurrency(trans.amount)}
            </div>
            <div class="transaction-actions">
                <button class="btn-small" onclick="editTransaction(${trans.id})">Edit</button>
                <button class="btn-small btn-danger" onclick="deleteTransaction(${trans.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function clearFilters() {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    loadTransactions();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('edit-trans-id').value = transaction.id;
    document.getElementById('edit-trans-type').value = transaction.type;
    document.getElementById('edit-trans-amount').value = transaction.amount;
    document.getElementById('edit-trans-date').value = transaction.date;
    document.getElementById('edit-trans-description').value = transaction.description || '';

    updateCategorySelect(document.getElementById('edit-trans-category'), transaction.type);
    document.getElementById('edit-trans-category').value = transaction.category_id;

    document.getElementById('edit-modal').style.display = 'block';
}

async function handleEditTransaction(e) {
    e.preventDefault();
    const id = document.getElementById('edit-trans-id').value;
    const formData = {
        type: document.getElementById('edit-trans-type').value,
        amount: parseFloat(document.getElementById('edit-trans-amount').value),
        category_id: parseInt(document.getElementById('edit-trans-category').value),
        description: document.getElementById('edit-trans-description').value,
        date: document.getElementById('edit-trans-date').value
    };

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Transaction updated successfully', 'success');
            closeEditModal();
            loadTransactions();
            if (currentView === 'dashboard') loadDashboard();
        } else {
            throw new Error('Failed to update transaction');
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        showMessage('Error updating transaction', 'error');
    }
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const response = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Transaction deleted successfully', 'success');
            loadTransactions();
            if (currentView === 'dashboard') loadDashboard();
        } else {
            throw new Error('Failed to delete transaction');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showMessage('Error deleting transaction', 'error');
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Bulk Upload
function setupBulkUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('csv-file');
    const uploadBtn = document.getElementById('upload-btn');

    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');

        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Upload button
    uploadBtn.addEventListener('click', handleBulkUpload);
}

function handleFileSelect() {
    const fileInput = document.getElementById('csv-file');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadArea = document.getElementById('upload-area');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        if (!file.name.endsWith('.csv')) {
            showMessage('Please select a CSV file', 'error');
            fileInput.value = '';
            uploadBtn.disabled = true;
            return;
        }

        uploadArea.querySelector('.upload-content p').textContent = `Selected: ${file.name}`;
        uploadBtn.disabled = false;
    } else {
        uploadArea.querySelector('.upload-content p').textContent = 'Click to select CSV file or drag and drop';
        uploadBtn.disabled = true;
    }
}

async function handleBulkUpload() {
    const fileInput = document.getElementById('csv-file');
    const uploadBtn = document.getElementById('upload-btn');
    const resultsDiv = document.getElementById('upload-results');
    const sourceSelect = document.getElementById('upload-source');

    if (!fileInput.files.length) {
        showMessage('Please select a file', 'error');
        return;
    }

    if (!sourceSelect.value) {
        showMessage('Please select a source/account', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('source', sourceSelect.value);

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    resultsDiv.innerHTML = '<div class="loading">Processing CSV file...</div>';

    try {
        const response = await fetch(`${API_URL}/transactions/bulk`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            displayUploadResults(result);

            // Reset form
            fileInput.value = '';
            sourceSelect.value = '';
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Upload Transactions';
            document.getElementById('upload-area').querySelector('.upload-content p').textContent =
                'Click to select CSV file or drag and drop';

            // Reload transactions if any were successful
            if (result.success > 0) {
                loadTransactions();
                if (currentView === 'dashboard') loadDashboard();
            }
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        resultsDiv.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Transactions';
    }
}

function displayUploadResults(result) {
    const resultsDiv = document.getElementById('upload-results');

    let html = '<div class="upload-results">';
    html += `<div class="result-summary">`;
    html += `<div class="result-stat success-stat">✓ ${result.success} transactions imported</div>`;

    if (result.skipped > 0) {
        html += `<div class="result-stat warning-stat">⊝ ${result.skipped} skipped (zero amount)</div>`;
    }

    if (result.failed > 0) {
        html += `<div class="result-stat error-stat">✗ ${result.failed} failed</div>`;
    }
    html += `</div>`;

    html += '<div class="upload-info">';
    html += '<p><strong>Auto-categorization applied:</strong> Transactions were automatically categorized based on description keywords.</p>';
    html += '<p>Review the imported transactions to ensure categories are correct.</p>';
    html += '</div>';

    if (result.errors && result.errors.length > 0) {
        html += '<div class="error-details">';
        html += '<h4>Errors:</h4>';
        html += '<ul>';
        result.errors.slice(0, 10).forEach(error => {
            html += `<li>${error}</li>`;
        });
        if (result.errors.length > 10) {
            html += `<li>... and ${result.errors.length - 10} more errors</li>`;
        }
        html += '</ul>';
        html += '</div>';
    }

    html += '</div>';
    resultsDiv.innerHTML = html;
}

// Categories
async function handleAddCategory(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('cat-name').value,
        type: document.getElementById('cat-type').value,
        color: document.getElementById('cat-color').value
    };

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Category added successfully', 'success');
            e.target.reset();
            document.getElementById('cat-color').value = '#6b7280';
            loadCategories();
            loadCategoriesList();
        } else {
            throw new Error('Failed to add category');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showMessage('Error adding category', 'error');
    }
}

async function loadCategoriesList() {
    const container = document.getElementById('categories-list');

    const incomeCategories = categories.filter(cat => cat.type === 'income');
    const expenseCategories = categories.filter(cat => cat.type === 'expense');

    container.innerHTML = `
        <div class="category-section">
            <h4>Income Categories</h4>
            ${incomeCategories.map(cat => `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-color-box" style="background-color: ${cat.color}"></span>
                        <span class="category-name">${cat.name}</span>
                    </div>
                    <button class="btn-small btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                </div>
            `).join('')}
        </div>
        <div class="category-section">
            <h4>Expense Categories</h4>
            ${expenseCategories.map(cat => `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-color-box" style="background-color: ${cat.color}"></span>
                        <span class="category-name">${cat.name}</span>
                    </div>
                    <button class="btn-small btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? This will fail if there are existing transactions.')) return;

    try {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Category deleted successfully', 'success');
            loadCategories();
            loadCategoriesList();
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to delete category', 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showMessage('Error deleting category', 'error');
    }
}

// Budgets
function loadBudgetForm() {
    populateCategorySelects();
}

async function handleSetBudget(e) {
    e.preventDefault();
    const formData = {
        month: document.getElementById('budget-month').value,
        category_id: parseInt(document.getElementById('budget-category').value),
        amount: parseFloat(document.getElementById('budget-amount').value)
    };

    try {
        const response = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Budget set successfully', 'success');
            e.target.reset();
            setDefaultDates();
        } else {
            throw new Error('Failed to set budget');
        }
    } catch (error) {
        console.error('Error setting budget:', error);
        showMessage('Error setting budget', 'error');
    }
}

async function loadBudgetStatus() {
    const month = document.getElementById('budget-status-month').value;
    if (!month) {
        showMessage('Please select a month', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/budgets/${month}/status`);
        const budgets = await response.json();
        displayBudgetStatus(budgets);
    } catch (error) {
        console.error('Error loading budget status:', error);
        showMessage('Error loading budget status', 'error');
    }
}

function displayBudgetStatus(budgets) {
    const container = document.getElementById('budget-status');
    if (budgets.length === 0) {
        container.innerHTML = '<p>No budgets set for this month.</p>';
        return;
    }

    container.innerHTML = budgets.map(budget => {
        const percentage = (budget.spent_amount / budget.budget_amount) * 100;
        const status = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'ok';

        return `
            <div class="budget-item">
                <div class="budget-header">
                    <span class="budget-category" style="color: ${budget.category_color}">
                        ${budget.category_name}
                    </span>
                    <span class="budget-amounts">
                        ${formatCurrency(budget.spent_amount)} / ${formatCurrency(budget.budget_amount)}
                    </span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-status ${status}">
                    ${percentage.toFixed(1)}% used
                    ${percentage > 100 ? ' - OVER BUDGET!' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Reports
async function loadReport() {
    const month = document.getElementById('report-month').value;
    if (!month) {
        showMessage('Please select a month', 'error');
        return;
    }

    try {
        // Load summary
        const summaryResponse = await fetch(`${API_URL}/reports/summary/${month}`);
        const summary = await summaryResponse.json();

        document.getElementById('report-income').textContent = formatCurrency(summary.total_income);
        document.getElementById('report-expenses').textContent = formatCurrency(summary.total_expense);
        document.getElementById('report-balance').textContent = formatCurrency(summary.balance);

        // Color code balance
        const balanceEl = document.getElementById('report-balance');
        balanceEl.className = summary.balance >= 0 ? 'value income' : 'value expense';

        // Load category breakdown
        const breakdownResponse = await fetch(`${API_URL}/reports/category/${month}`);
        const breakdown = await breakdownResponse.json();

        displayCharts(breakdown);
    } catch (error) {
        console.error('Error loading report:', error);
        showMessage('Error loading report', 'error');
    }
}

function displayCharts(breakdown) {
    const expenseData = breakdown.filter(item => item.type === 'expense');
    const incomeData = breakdown.filter(item => item.type === 'income');

    // Expense chart
    const expenseCtx = document.getElementById('expense-chart');
    if (window.expenseChart) window.expenseChart.destroy();

    if (expenseData.length > 0) {
        window.expenseChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: expenseData.map(item => item.name),
                datasets: [{
                    data: expenseData.map(item => item.total),
                    backgroundColor: expenseData.map(item => item.color)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Income chart
    const incomeCtx = document.getElementById('income-chart');
    if (window.incomeChart) window.incomeChart.destroy();

    if (incomeData.length > 0) {
        window.incomeChart = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: incomeData.map(item => item.name),
                datasets: [{
                    data: incomeData.map(item => item.total),
                    backgroundColor: incomeData.map(item => item.color)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type) {
    // Simple alert for now - can be enhanced with better UI
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}
