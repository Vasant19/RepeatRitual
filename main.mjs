import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const store = new Store();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');

    // Load tasks from store and send to renderer
    const tasks = store.get('tasks') || [];
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('load-tasks', tasks);
    });
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle adding tasks
ipcMain.handle('add-task', (event, taskText) => {
    const tasks = store.get('tasks') || [];
    tasks.push({ text: taskText, completed: false });
    store.set('tasks', tasks);
    return tasks;
});
