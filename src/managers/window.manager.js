const { BrowserWindow } = require("electron");
const path = require("path");

class WindowManager {
    constructor() {
        this.mainWindow = null;
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            webPreferences: {
                preload: path.join(__dirname, "../../preload.js"),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        this.mainWindow.loadFile("index.html");
    }

    createChatWindow() {
        if (this.chatWindow && !this.chatWindow.isDestroyed()) {
            this.chatWindow.show();
            return;
        }

        this.chatWindow = new BrowserWindow({
            width: 500,
            height: 700,
            webPreferences: {
                preload: path.join(__dirname, "../../preload.js"),
                contextIsolation: true,
                nodeIntegration: false
            }
        });

        this.chatWindow.loadFile("chat.html");

        this.chatWindow.on("closed", () => {
            this.chatWindow = null;
        });
    }

    showChatWindow() {
        if (this.chatWindow && !this.chatWindow.isDestroyed()) {
            this.chatWindow.show();
        }
    }
}

module.exports = WindowManager;