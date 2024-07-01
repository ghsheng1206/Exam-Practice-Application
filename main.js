const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');  // Make sure to import the crypto module
const windowStateKeeper = require('electron-window-state');

const secretWord = process.env.SECRET_WORD || 'This is secret word for answer 1234!@#$';

let mainWindow;

function createWindow() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1400,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: path.join(__dirname, 'Icon', 'PracticeGo_icon.png'), // Update the icon path
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false // Disable the developer tools
    },
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  ipcMain.handle('hash-answer', async (event, userAnswer) => {
    return hashAnswer(userAnswer, secretWord);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on('read-file', (event) => {
  const filePaths = dialog.showOpenDialogSync(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (filePaths && filePaths.length > 0) {
    const filePath = filePaths[0];
    const data = fs.readFileSync(filePath, 'utf8');
    event.reply('file-contents', data);
  }
});

ipcMain.on('load-update-question-page', () => {
  mainWindow.loadFile('updateQuestionPage.html');
});

function hashAnswer(answer, secretWord) {
  return crypto.createHash('sha256').update(answer + secretWord).digest('hex');
}
