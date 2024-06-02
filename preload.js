// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, (event, ...args) => callback(event, ...args));
    },
    once: (channel, callback) => {
      ipcRenderer.once(channel, (event, ...args) => callback(event, ...args));
    },
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  hashAnswer: (userAnswer) => ipcRenderer.invoke('hash-answer', userAnswer)
});