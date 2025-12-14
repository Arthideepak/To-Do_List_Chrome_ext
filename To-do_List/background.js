/**
 * background.js - Service Worker for the To-do List extension
 * Handles background tasks and event listeners
 */

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    console.log('To-do List extension installed/updated');

    // Initialize storage with empty todos array if not already present
    chrome.storage.local.get(['todos'], (result) => {
        if (result.todos === undefined) {
            chrome.storage.local.set({ todos: [] });
        }
    });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTodos') {
        // Retrieve all todos from storage
        chrome.storage.local.get(['todos'], (result) => {
            sendResponse({ todos: result.todos || [] });
        });
        return true; // Indicate async response
    }

    if (request.action === 'deleteTodo') {
        // Delete a specific todo by ID
        const todoId = request.id;

        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            const updatedTodos = todos.filter(todo => todo.id !== todoId);

            chrome.storage.local.set({ todos: updatedTodos }, () => {
                sendResponse({ success: true });
            });
        });
        return true; // Indicate async response
    }

    if (request.action === 'toggleTodo') {
        // Toggle the completed status of a todo
        const todoId = request.id;

        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            const todoIndex = todos.findIndex(todo => todo.id === todoId);

            if (todoIndex !== -1) {
                todos[todoIndex].completed = !todos[todoIndex].completed;

                chrome.storage.local.set({ todos: todos }, () => {
                    sendResponse({ success: true, completed: todos[todoIndex].completed });
                });
            } else {
                sendResponse({ success: false });
            }
        });
        return true; // Indicate async response
    }

    if (request.action === 'updateTodo') {
        // Update a specific todo
        const todoId = request.id;
        const updates = request.updates;

        chrome.storage.local.get(['todos'], (result) => {
            const todos = result.todos || [];
            const todoIndex = todos.findIndex(todo => todo.id === todoId);

            if (todoIndex !== -1) {
                todos[todoIndex] = { ...todos[todoIndex], ...updates };

                chrome.storage.local.set({ todos: todos }, () => {
                    sendResponse({ success: true, todo: todos[todoIndex] });
                });
            } else {
                sendResponse({ success: false });
            }
        });
        return true; // Indicate async response
    }
});
