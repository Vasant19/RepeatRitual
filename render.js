// Imports and type definitions for Electron
const { ipcRenderer } = require('electron');

// Theme handling
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle();
    document.getElementById('toggle-dark-mode').textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
});

document.getElementById('reset-to-system').addEventListener('click', async () => {
    await window.darkMode.system();
});

// Task management
class Task {
    constructor(id, name, imageUrl, reminderTime, status = 'todo') {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.reminderTime = reminderTime;
        this.status = status;
    }

    createTaskElement() {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.setAttribute('draggable', true);
        taskCard.id = `task-${this.id}`;

        taskCard.innerHTML = `
            <img src="${this.imageUrl}" alt="${this.name}" class="task-image">
            <div class="task-content">
                <div class="task-title">${this.name}</div>
                ${this.reminderTime ? 
                    `<div class="task-reminder">⏰ ${new Date(this.reminderTime).toLocaleString()}</div>` 
                    : ''}
                <button class="btn btn-primary delete-task" data-task-id="${this.id}">Delete</button>
            </div>
        `;

        // Add drag and drop functionality
        this.addDragListeners(taskCard);
        
        return taskCard;
    }

    addDragListeners(element) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', this.id);
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });
    }
}

class TaskManager {
    constructor() {
        this.tasks = new Map();
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.setupDragAndDrop();
            this.loadTasks();
        });
    }
    

    setupEventListeners() {
        document.getElementById('add-task').addEventListener('click', () => this.addNewTask());
        
        // Delete task event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-task')) {
                const taskId = e.target.dataset.taskId;
                this.deleteTask(taskId);
            }
        });
    }

    setupDragAndDrop() {
        const lists = document.querySelectorAll('.task-list');
        
        lists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(list, e.clientY);
                const dragging = document.querySelector('.dragging');
                if (afterElement) {
                    list.insertBefore(dragging, afterElement);
                } else {
                    list.appendChild(dragging);
                }
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain');
                const task = this.tasks.get(taskId);
                if (task) {
                    const newStatus = list.id.replace('-list', '');
                    this.updateTaskStatus(taskId, newStatus);
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async addNewTask() {
        const taskInput = document.getElementById('task-input');
        const taskImageInput = document.getElementById('task-image');
        const reminderInput = document.getElementById('task-reminder');
    
        console.log('Adding new task:', {
            taskInput: taskInput.value,
            hasImage: taskImageInput.files.length > 0,
            reminder: reminderInput.value
        });
    
        if (taskInput.value && taskImageInput.files.length > 0) {
            try {
                const taskId = Date.now().toString();
                const imageUrl = await this.processImage(taskImageInput.files[0]);
                console.log('Processed image URL:', imageUrl);
                
                const task = new Task(
                    taskId,
                    taskInput.value,
                    imageUrl,
                    reminderInput.value
                );
    
                this.tasks.set(taskId, task);
                this.renderTask(task);
                this.saveTasks();
                
                if (reminderInput.value) {
                    this.setReminder(task);
                }
    
                // Clear inputs
                taskInput.value = '';
                taskImageInput.value = '';
                reminderInput.value = '';
            } catch (error) {
                console.error('Error adding task:', error);
            }
        } else {
            console.log('Validation failed:', {
                hasTaskName: Boolean(taskInput.value),
                hasImage: taskImageInput.files.length > 0
            });
        }
    }
    async processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    renderTask(task) {
        const taskElement = task.createTaskElement();
        document.getElementById(`${task.status}-list`).appendChild(taskElement);
    }

    deleteTask(taskId) {
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
            taskElement.remove();
            this.tasks.delete(taskId);
            this.saveTasks();
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
        }
    }

    setReminder(task) {
        const reminderTime = new Date(task.reminderTime).getTime();
        const now = new Date().getTime();
        
        if (reminderTime > now) {
            setTimeout(() => {
                this.showReminder(task);
            }, reminderTime - now);
        }
    }

    showReminder(task) {
        // Send notification using Electron's notification API
        new Notification('Task Reminder', {
            body: `Don't forget: ${task.name}`,
            icon: task.imageUrl
        });
    }

    saveTasks() {
        const tasksData = Array.from(this.tasks.entries());
        localStorage.setItem('tasks', JSON.stringify(tasksData));
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const tasksData = JSON.parse(savedTasks);
            tasksData.forEach(([id, taskData]) => {
                const task = new Task(
                    id,
                    taskData.name,
                    taskData.imageUrl,
                    taskData.reminderTime,
                    taskData.status
                );
                this.tasks.set(id, task);
                this.renderTask(task);
                if (taskData.reminderTime) {
                    this.setReminder(task);
                }
            });
        }
    }
}

// Initialize the task manager when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();

    // Handle reminders from main process
    window.electron.onReminder((task) => {
        taskManager.showReminder(task);
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            taskManager.addNewTask();
        }
    });

    // Add search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search tasks...';
    searchInput.classList.add('form-input', 'search-input');
    document.querySelector('.header').appendChild(searchInput);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const taskElements = document.querySelectorAll('.task-card');

        taskElements.forEach(taskElement => {
            const taskTitle = taskElement.querySelector('.task-title').textContent.toLowerCase();
            if (taskTitle.includes(searchTerm)) {
                taskElement.style.display = '';
            } else {
                taskElement.style.display = 'none';
            }
        });
    });
});