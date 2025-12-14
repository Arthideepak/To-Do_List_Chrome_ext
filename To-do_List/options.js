/**
 * options.js - Manages the main to-do list view
 * Displays, filters, and manages all saved to-do items
 */

// Store for managing todos and filter state
let allTodos = [];
let currentFilter = 'all';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

/**
 * Load todos from storage and display them
 */
function loadTodos() {
    showLoadingState();

    // Request todos from background script
    chrome.runtime.sendMessage({ action: 'getTodos' }, (response) => {
        allTodos = response.todos || [];

        // Simulate a slight delay to show loading state
        setTimeout(() => {
            displayTodos();
            updateStatistics();
            hideLoadingState();
        }, 300);
    });
}

/**
 * Display todos in the UI with current filter applied
 */
function displayTodos() {
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');

    // Filter todos based on current filter
    const filteredTodos = currentFilter === 'all'
        ? allTodos
        : allTodos.filter(todo => todo.category === currentFilter);

    // Clear the list
    todoList.innerHTML = '';

    // Check if there are any todos to display
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
        todoList.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    todoList.style.display = 'block';

    // Create and append todo items (sorted by date, newest first)
    filteredTodos
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
        });
}

/**
 * Create a DOM element for a single todo item
 * @param {Object} todo - The todo object
 * @returns {HTMLElement} - The created todo element
 */
function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.category}${todo.completed ? ' completed' : ''}`;
    todoItem.id = `todo-${todo.id}`;

    // Format the created date
    const createdDate = new Date(todo.createdAt);
    const formattedDate = formatDate(createdDate);

    // Create the todo HTML
    todoItem.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            data-id="${todo.id}"
        >
        <div class="todo-content">
            <div class="todo-header">
                <div class="todo-title">${escapeHtml(todo.title)}</div>
                <span class="todo-category ${todo.category}">${capitalizeCategory(todo.category)}</span>
            </div>
            ${todo.url ? `<a href="${todo.url}" target="_blank" class="todo-url" title="${todo.url}">${shortUrl(todo.url)}</a>` : ''}
            ${todo.notes ? `<div class="todo-notes"><strong>Notes:</strong> ${escapeHtml(todo.notes)}</div>` : ''}
            <div class="todo-meta">
                <span class="todo-date">Added: ${formattedDate}</span>
                <div class="todo-actions">
                    <button class="todo-btn todo-btn-edit" data-id="${todo.id}" onclick="editTodo('${todo.id}')">Edit</button>
                    <button class="todo-btn todo-btn-delete" data-id="${todo.id}" onclick="deleteTodo('${todo.id}')">Delete</button>
                </div>
            </div>
        </div>
    `;

    // Add event listener to checkbox
    const checkbox = todoItem.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    return todoItem;
}

/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Yesterday at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

/**
 * Toggle the completed status of a todo
 * @param {number} todoId - The id of the todo to toggle
 */
function toggleTodo(todoId) {
    chrome.runtime.sendMessage(
        { action: 'toggleTodo', id: todoId },
        (response) => {
            if (response.success) {
                // Update local state
                const todo = allTodos.find(t => t.id === todoId);
                if (todo) {
                    todo.completed = response.completed;
                }

                // Update UI
                const todoElement = document.getElementById(`todo-${todoId}`);
                if (response.completed) {
                    todoElement.classList.add('completed');
                } else {
                    todoElement.classList.remove('completed');
                }

                updateStatistics();
            }
        }
    );
}

/**
 * Delete a todo item
 * @param {number} todoId - The id of the todo to delete
 */
function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this to-do item?')) {
        chrome.runtime.sendMessage(
            { action: 'deleteTodo', id: todoId },
            (response) => {
                if (response.success) {
                    // Update local state
                    allTodos = allTodos.filter(t => t.id !== todoId);

                    // Update UI
                    const todoElement = document.getElementById(`todo-${todoId}`);
                    todoElement.style.animation = 'slideIn 0.3s ease reverse';
                    setTimeout(() => {
                        todoElement.remove();
                        displayTodos();
                        updateStatistics();
                    }, 300);
                }
            }
        );
    }
}

/**
 * Edit a todo item (basic functionality - can be expanded)
 * @param {number} todoId - The id of the todo to edit
 */
function editTodo(todoId) {
    const todo = allTodos.find(t => t.id === todoId);
    if (!todo) return;

    // Simple edit prompt (can be replaced with a modal dialog)
    const newTitle = prompt('Edit title:', todo.title);
    if (newTitle && newTitle.trim()) {
        chrome.runtime.sendMessage(
            { action: 'updateTodo', id: todoId, updates: { title: newTitle.trim() } },
            (response) => {
                if (response.success) {
                    todo.title = newTitle.trim();
                    displayTodos();
                }
            }
        );
    }
}

/**
 * Update statistics display
 */
function updateStatistics() {
    const total = allTodos.length;
    const completed = allTodos.filter(todo => todo.completed).length;
    const pending = total - completed;

    document.getElementById('total-count').textContent = total;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('pending-count').textContent = pending;
}

/**
 * Set up event listeners for filter buttons and other controls
 */
function setupEventListeners() {
    // Filter button click handlers
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Update filter and display
            currentFilter = e.target.dataset.filter;
            displayTodos();
        });
    });

    // Clear completed button
    document.getElementById('clear-all-btn').addEventListener('click', () => {
        if (confirm('Delete all completed to-do items?')) {
            allTodos = allTodos.filter(todo => !todo.completed);

            chrome.storage.local.set({ todos: allTodos }, () => {
                displayTodos();
                updateStatistics();
            });
        }
    });
}

/**
 * Show loading state
 */
function showLoadingState() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('todo-list').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    document.getElementById('loading-state').style.display = 'none';
}

/**
 * Utility function to escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Capitalize category name
 * @param {string} category - Category name
 * @returns {string} - Capitalized category
 */
function capitalizeCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Shorten URL for display
 * @param {string} url - URL to shorten
 * @returns {string} - Shortened URL
 */
function shortUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url.substring(0, 30) + (url.length > 30 ? '...' : '');
    }
}

// Auto-refresh todos when storage changes (in case of multiple windows)
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.todos) {
        allTodos = changes.todos.newValue || [];
        displayTodos();
        updateStatistics();
    }
});
