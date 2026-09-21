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

        chatManager.clearMessages();
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

        try {
            chatManager.addMessage("user", message);

            const response = await aiManager.generateResponse(
                chatManager.getMessages()
            );

            chatManager.addAssistantMessage(response);

            return {
                success: true,
                message: response
            };

        } catch (error) {
            console.error("AI response error:", error);

            let userMessage = "Something went wrong. Please try again.";

            if (error.status === 429) {
                userMessage =
                    "API quota exceeded. Please try again later or switch to another provider.";
            } else if (error.status === 503) {
                userMessage =
                    "AI service is temporarily overloaded. Please try again shortly.";
            } else if (error.status === 401 || error.status === 403) {
                userMessage =
                    "API authentication failed. Please check your API configuration.";
            } else if (error.status >= 500) {
                userMessage =
                    "AI provider is experiencing a server error. Please try again.";
            }

            return {
                success: false,
                message: userMessage
            };
        }
    });

    // GET MESSAGES //
    ipcMain.handle("chat:get-messages", async () => {
        return chatManager.getMessages();
    });

    ipcMain.handle("ai:set-provider", async (event, providerName) => {
        try {
            const result = await aiManager.setProvider(providerName);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    });

    ipcMain.handle("ai:get-provider", async () => {
        return {
            provider: aiManager.getProvider()
        };
    });

    ipcMain.handle("ai:get-model", async () => {
        return {
            model: aiManager.getModel()
        };
    });

    ipcMain.handle("ai:set-model", async (event, modelName) => {
        try {
            const result = await aiManager.setModel(modelName);

            return {
                success: true,
                ...result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    });

    ipcMain.handle("ai:get-models", async () => {
        const models = await aiManager.getModels();

        console.log("Models from AIManager:", models);

        return {
            models: models
        };
    });

    ipcMain.handle("ai:refresh-models", async () => {
        try {
            const models = await aiManager.refreshModels();

            return {
                success: true,
                models
            };
        } catch (error) {
            console.error("Model refresh error:", error);

            return {
                success: false,
                message: error.message
            };
        }
    });


});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});