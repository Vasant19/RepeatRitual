# RepeatRitual ✅
<img src="https://img.shields.io/badge/Repo%20in%20Progress-brightgreen.svg" alt="Repo in Progress" width="150" />

A simple desktop todo application for managing your daily recurring tasks.

## Context

I created this app to help me manage my daily tasks and habits. It's a simple app that helps me stay organized and focused and also removing the clutter with minimalistic design. I packaged it as a desktop app if anyone else finds it useful. Do try it out! I might add more features in the future.

## Features

- ☑️ Create and manage daily tasks
- 🔄 Set tasks to automatically repeat
- 🖥️ Desktop notifications for task reminders
- 🌓 Light/Dark mode support
- 💾 Offline-first - all data stored locally

## Tech Stack

- Node.js + Electron for desktop app
- Tailwind CSS for styling
- Local storage for data persistence

## Installation

```bash
# Clone the repository
git clone https://github.com/Vasant19/RepeatRitual.git

# Install dependencies
npm install

# Start the app
npm run start
```

## How to Use

### Add a Task
1. Click the "Add Task" button
2. Enter task name
3. Toggle "Repeat Daily" if needed
4. Set reminder time (optional)
5. Click Save

### Manage Tasks
- Click checkbox to complete task
- Click edit icon to modify task
- Click delete icon to remove task
- Tasks automatically reset each day

## Screenshot

![App Screenshot](/screenshots/app.png)

## UI Components

```jsx
// Main Task Input
const TaskInput = () => {
  return (
    <div className="flex gap-2 p-4 border-b">
      <input 
        type="text"
        placeholder="Add a new task..."
        className="flex-1 px-4 py-2 rounded-lg border 
                  focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-800"
      />
      <button className="bg-blue-500 text-white px-4 
                         py-2 rounded-lg hover:bg-blue-600">
        Add Task
      </button>
    </div>
  );
};

// Task Item
const TaskItem = ({ title, isComplete }) => {
  return (
    <div className="flex items-center gap-3 p-3 
                    hover:bg-gray-50 dark:hover:bg-gray-800">
      <input 
        type="checkbox"
        checked={isComplete}
        className="h-5 w-5 rounded border-gray-300"
      />
      <span className={isComplete ? 'line-through' : ''}>
        {title}
      </span>
    </div>
  );
};
```

## Configuration

Basic configuration can be done through the app settings:
- Enable/disable notifications
- Choose theme (light/dark)
- Set default reminder time

## License

MIT License

---

Built with Electron and Tailwind CSS
