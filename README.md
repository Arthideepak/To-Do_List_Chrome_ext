# To-do List Chrome Extension

A simple and elegant Chrome extension for saving and managing categorized to-do items from your current browser tabs.

## Features

✨ **Core Features:**
- 📌 Save current tab as a to-do item with one click
- 🏷️ Categorize tasks (Work, Study, Shopping, Personal, Other)
- 📝 Add notes to each task
- ✅ Mark tasks as completed
- 🗂️ Filter tasks by category
- 📊 View statistics (total, completed, pending tasks)
- 🔗 Quick access to original tab URLs
- 🗑️ Delete individual tasks or clear all completed tasks
- 💾 All data stored locally in Chrome storage
- 📱 Responsive and mobile-friendly design

## Installation

### From GitHub (Development Mode)

1. **Clone or download** this repository to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (top right corner)
4. **Click "Load unpacked"**
5. **Select the `To-do_List` folder**
6. The extension will appear in your Chrome extensions list

### Usage

1. **Click the extension icon** in your Chrome toolbar
2. **The popup will auto-fill** with the current tab's title and URL
3. **Select a category** from the dropdown (required)
4. **Add optional notes** (max 200 characters)
5. **Click "Save To-do"** to save the item
6. **Click "View All"** to see your complete to-do list

## File Structure

```
To-do_List/
├── manifest.json          # Extension manifest and configuration
├── popup.html            # Popup window UI
├── popup.js              # Popup window logic
├── popup.css             # (included in styles.css)
├── styles.css            # Styling for popup
├── options.html          # Full to-do list view
├── options.js            # Logic for to-do list management
├── options.css           # Styling for to-do list view
├── background.js         # Service worker for background tasks
├── images/               # Icon files (16x16, 48x48, 128x128)
└── README.md             # This file
```

## File Descriptions

### `manifest.json`
Defines the extension's metadata, permissions, and entry points:
- Extension name, version, and description
- Required permissions (tabs, storage)
- Popup and background service worker configuration
- Icon locations

### `popup.html`
The UI displayed when clicking the extension icon:
- Form for entering task information
- Category dropdown
- Notes textarea with character counter
- Action buttons (Save, View All)
- Status messages (success/error)

### `popup.js`
Handles popup interactions:
- Auto-populates current tab info
- Form validation
- Saves tasks to Chrome storage
- Manages UI feedback (success/error messages)
- Character counting for notes

### `styles.css`
Styling for the popup interface:
- Gradient background and modern UI
- Form styling and interactions
- Button animations
- Responsive design for smaller screens
- Success/error message styling

### `options.html`
Full-page view of all saved tasks:
- Filter buttons by category
- Statistics dashboard (total, completed, pending)
- Scrollable task list
- Edit and delete buttons for each task
- "Clear Completed" button

### `options.js`
Manages the task list view:
- Load and display all tasks
- Filter tasks by category
- Toggle task completion status
- Delete tasks
- Edit task titles
- Update statistics
- Format dates and URLs for display

### `background.js`
Service worker handling background operations:
- Extension initialization and storage setup
- Message passing between popup and options page
- Task CRUD operations (Create, Read, Update, Delete)
- Storage management

## How It Works

### Data Flow

1. **Saving a Task:**
   - User fills popup form with task details
   - `popup.js` validates the input
   - Task is sent to Chrome storage via `background.js`
   - Success message is displayed

2. **Viewing Tasks:**
   - User clicks "View All" button
   - Opens `options.html` page
   - `options.js` retrieves all tasks from storage
   - Tasks are displayed with filtering and sorting

3. **Managing Tasks:**
   - Users can toggle completion status
   - Edit task titles
   - Delete individual or completed tasks
   - Filter by category

### Storage

All data is stored in Chrome's local storage (chrome.storage.local):
```javascript
{
  todos: [
    {
      id: 1234567890,
      title: "Task title",
      url: "https://example.com",
      category: "work",
      notes: "Optional notes",
      createdAt: "2024-12-08T10:30:00.000Z",
      completed: false
    }
  ]
}
```

## Customization

### Change Colors
Edit the color values in `styles.css` and `options.css`:
- Main gradient: `#667eea` and `#764ba2`
- Category colors defined in `.todo-item.{category}` classes

### Add New Categories
1. Edit `popup.html` to add new `<option>` in the category select
2. Add new color in `options.css` for the new category

### Modify Storage Limit
Edit `maxlength` attribute in `popup.html` textarea (currently 200 characters)

## Browser Compatibility

- **Chrome**: 88+
- **Edge**: 88+ (Chromium-based)
- **Brave**: Latest version
- **Opera**: Latest version

## Permissions Used

| Permission | Purpose |
|-----------|---------|
| `tabs` | Access current tab information |
| `activeTab` | Access the currently active tab |
| `scripting` | Inject scripts if needed |
| `storage` | Store and retrieve tasks locally |

## Known Limitations

- Data is stored locally per browser profile (not synced across devices)
- No cloud backup functionality
- Edit functionality is basic (title only via prompt dialog)
- No recurring tasks or due dates

## Future Enhancements

- 🌐 Cloud sync with Google account
- 📅 Due date and reminder notifications
- 🔄 Recurring tasks
- 🎨 Custom category colors
- 📤 Export/Import functionality
- 🏠 Custom home dashboard
- 🔔 Browser notifications for due tasks
- 🌓 Dark mode theme

## Troubleshooting

**Extension not showing?**
- Go to `chrome://extensions/`
- Make sure Developer mode is enabled
- Check that the extension is enabled

**Can't save tasks?**
- Ensure you've selected a category
- Check browser console for errors (Ctrl+Shift+J)
- Try clearing Chrome cache and reloading

**Tasks not persisting?**
- Verify you're not in Incognito mode (storage disabled)
- Check Chrome storage quota hasn't been exceeded

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for Chrome users**
