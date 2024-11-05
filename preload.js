const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        darkMode: {
            toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
            system: () => ipcRenderer.invoke('dark-mode:system')
        },
        notifications: {
            schedule: (task) => ipcRenderer.send('schedule-notification', task),
            cancel: (taskId) => ipcRenderer.send('cancel-notification', taskId)
        },
        onReminder: (callback) => ipcRenderer.on('reminder', (event, task) => callback(task)),
        store: {
            get: (key) => ipcRenderer.invoke('store:get', key),
            set: (key, value) => ipcRenderer.invoke('store:set', key, value)
        }
    }
);