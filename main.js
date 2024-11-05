const { app, BrowserWindow, ipcMain, nativeTheme, Notification } = require('electron');
const path = require('path');

// We'll initialize the store after importing it dynamically
let store;

// Dynamically import electron-store
async function initializeStore() {
    const { default: Store } = await import('electron-store');
    store = new Store();
}

let mainWindow;

async function createWindow() {
    // Initialize store before creating the window
    await initializeStore();

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#ffffff',
        show: false,
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle dark mode
ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = 'light';
    } else {
        nativeTheme.themeSource = 'dark';
    }
    return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system';
});

// Handle notifications
const scheduledNotifications = new Map();

ipcMain.on('schedule-notification', (event, task) => {
    const { id, name, reminderTime } = task;
    const now = new Date().getTime();
    const notificationTime = new Date(reminderTime).getTime();

    if (notificationTime > now) {
        const timeout = setTimeout(() => {
            new Notification({
                title: 'Task Reminder',
                body: `Time to work on: ${name}`,
                silent: false,
                urgency: 'normal'
            }).show();
            
            mainWindow.webContents.send('reminder', task);
            scheduledNotifications.delete(id);
        }, notificationTime - now);

        scheduledNotifications.set(id, timeout);
    }
});

ipcMain.on('cancel-notification', (event, taskId) => {
    const timeout = scheduledNotifications.get(taskId);
    if (timeout) {
        clearTimeout(timeout);
        scheduledNotifications.delete(taskId);
    }
});

// Handle persistent storage
ipcMain.handle('store:get', async (event, key) => {
    return store.get(key);
});

ipcMain.handle('store:set', async (event, key, value) => {
    store.set(key, value);
});

// Window control handlers
ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});