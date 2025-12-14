/**
 * popup.js - Handles the popup window interactions
 * Manages form input, validation, and communication with background script
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the popup
    initializePopup();

    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize popup by fetching current tab information
 */
function initializePopup() {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];

            // Populate the tab information fields
            document.getElementById('title').value = currentTab.title || 'Untitled';
            document.getElementById('url').value = currentTab.url || 'No URL';
        }
    });
}

/**
 * Set up event listeners for form elements
 */
function setupEventListeners() {
    const saveBtn = document.getElementById('save-btn');
    const viewBtn = document.getElementById('view-btn');
    const categorySelect = document.getElementById('category');
    const notesTextarea = document.getElementById('notes');
    const charCountSpan = document.getElementById('char-count');

    // Save button click handler
    saveBtn.addEventListener('click', saveToDoItem);

    // View All button click handler
    viewBtn.addEventListener('click', openViewAllPage);

    // Character count tracker for notes
    notesTextarea.addEventListener('input', () => {
        charCountSpan.textContent = notesTextarea.value.length;
    });

    // Enable/disable save button based on category selection
    categorySelect.addEventListener('change', () => {
        saveBtn.disabled = categorySelect.value === '';
    });
}

/**
 * Save the current tab as a to-do item
 */
function saveToDoItem() {
    // Get form values
    const title = document.getElementById('title').value.trim();
    const url = document.getElementById('url').value.trim();
    const category = document.getElementById('category').value;
    const notes = document.getElementById('notes').value.trim();

    // Validation
    if (!category) {
        showError('Please select a category');
        return;
    }

    if (!title) {
        showError('Title cannot be empty');
        return;
    }

    // Create to-do item object
    const todoItem = {
        id: Date.now(), // Unique ID using timestamp
        title: title,
        url: url,
        category: category,
        notes: notes,
        createdAt: new Date().toISOString(),
        completed: false
    };

    // Save to Chrome storage
    chrome.storage.local.get(['todos'], (result) => {
        const todos = result.todos || [];
        todos.push(todoItem);

        chrome.storage.local.set({ todos: todos }, () => {
            // Show success message
            showSuccess();

            // Reset form
            resetForm();

            // Auto-hide success message after 2 seconds
            setTimeout(() => {
                document.getElementById('success-message').style.display = 'none';
            }, 2000);
        });
    });
}

/**
 * Open the view all to-do items page
 */
function openViewAllPage() {
    // Create a new tab with the options page
    chrome.tabs.create({
        url: 'options.html'
    });
}

/**
 * Show success message
 */
function showSuccess() {
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'block';
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    errorMsg.textContent = '✗ ' + message;
    errorMsg.style.display = 'block';
    successMsg.style.display = 'none';
}

/**
 * Reset the form to initial state
 */
function resetForm() {
    document.getElementById('category').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('save-btn').disabled = true;

    // Re-fetch current tab info
    initializePopup();
}
