document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await window.darkMode.toggle();
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light';
});

document.getElementById('reset-to-system').addEventListener('click', async () => {
    await window.darkMode.system();
    document.getElementById('theme-source').innerHTML = 'System';
});

// Function to add a new task to the list
const addTask = async () => {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    if (taskText) {
        const taskList = document.getElementById('task-list');

        // Create a new list item with a checkbox and text
        const taskItem = document.createElement('li');
        taskItem.classList.add('flex', 'items-center', 'py-2', 'animate-fade-in');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('mr-2');

        const taskLabel = document.createElement('span');
        taskLabel.textContent = taskText;

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskLabel);
        taskList.appendChild(taskItem);

        // Save task in store
        await window.taskManager.addTask(taskText);

        // Clear the input field
        taskInput.value = '';
    }
};

// Attach addTask function to the button
document.getElementById('add-task-button').addEventListener('click', addTask);

// Load tasks from main process
window.electron.on('load-tasks', (event, tasks) => {
    const taskList = document.getElementById('task-list');
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('flex', 'items-center', 'py-2', 'animate-fade-in');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('mr-2');

        const taskLabel = document.createElement('span');
        taskLabel.textContent = task.text;

        if (task.completed) {
            checkbox.checked = true;
            taskLabel.classList.add('line-through', 'text-gray-400');
        }

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskLabel);
        taskList.appendChild(taskItem);
    });
});
