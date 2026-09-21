require("dotenv").config();

const { app, ipcMain } = require("electron");
const WindowManager = require("./src/managers/window.manager");
const SessionManager = require("./src/managers/session.manager");
const ChatManager = require("./src/managers/chat.manager");
const AIManager = require("./src/managers/ai.manager");

let windowManager;
let sessionManager;
let chatManager;
let aiManager;

app.whenReady().then(() => {
    windowManager = new WindowManager();
    sessionManager = new SessionManager();
    chatManager = new ChatManager();
    aiManager = new AIManager();

    // MAIN WINDOW //
    windowManager.createMainWindow();
    
    // START SESSION //
    ipcMain.handle("session:start", async () => {
        console.log("Session start requested");

        sessionManager.start();

        // CHAT WINDOW //
        windowManager.createChatWindow();

        return {
            success: true,
            message: "Session started",
            active: sessionManager.isActive()
        };
    });

    // STOP SESSION //
    ipcMain.handle("session:stop", async () => {
        console.log("Session stop requested");

        sessionManager.stop();

        return {
            success: true,
            message: "Session stopped",
            active: sessionManager.isActive()
        };
    });

    // GET SESSION STATE //
    ipcMain.handle("session:get-state", async () => {
        console.log("Session state requested");

        return {
            active: sessionManager.isActive()
        };
    });

    ipcMain.handle("chat:send", async (event, message) => {
        if (!sessionManager.isActive()) {
            return {
                success: false,
                message: "Cannot send message. Session is inactive."
            };
        }

        chatManager.addMessage("user", message);

        const response = await aiManager.generateResponse(
            chatManager.getMessages()
        );

        chatManager.addAssistantMessage(response);

        console.log("Messages:", chatManager.getMessages());

        return {
            success: true,
            message: response
        };
    });

    // GET MESSAGES //
    ipcMain.handle("chat:get-messages", async () => {
        return chatManager.getMessages();
    });


});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});