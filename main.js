require("dotenv").config();

const { app, ipcMain } = require("electron");
const WindowManager = require("./src/managers/window.manager");
const SessionManager = require("./src/managers/session.manager");
const ChatManager = require("./src/managers/chat.manager");
const AIManager = require("./src/managers/ai.manager");
const SpeechManager = require("./src/managers/speech.manager");

let windowManager;
let sessionManager;
let chatManager;
let aiManager;

app.whenReady().then(() => {
    windowManager = new WindowManager();
    sessionManager = new SessionManager();
    chatManager = new ChatManager();
    aiManager = new AIManager();
    speechManager = new SpeechManager();

    console.log(
        "Speech provider:",
        speechManager.getProvider()
    );

    // speechManager.setProvider("azure");

    console.log(
        "Speech provider:",
        speechManager.getProvider()
    );

    // MAIN WINDOW //
    windowManager.createMainWindow();
    
    // START SESSION //
    // ipcMain.handle("session:start", async () => {
    //     console.log("Session start requested");

    //     chatManager.clearMessages();
    //     sessionManager.start();

    //     // CHAT WINDOW //
    //     windowManager.createChatWindow();

    //     return {
    //         success: true,
    //         message: "Session started",
    //         active: sessionManager.isActive()
    //     };
    // });

    // START SESSION
    ipcMain.handle("session:start", async () => {
        console.log("Session start requested");

        const sessionId = sessionManager.start();

        chatManager.startSession(sessionId);
        console.log("Session started:", sessionId);

        windowManager.createChatWindow();

        windowManager.sendToChatWindow("session:started");

        return {
            success: true,
            message: "Session started",
            active: sessionManager.isActive(),
            sessionId
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

    // GET SESSION STATE
    ipcMain.handle("session:get-state", async () => {
        return {
            active: sessionManager.isActive(),
            sessionId: sessionManager.getSessionId()
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
                chatManager.getMessages(),
                (chunk) => {
                    event.sender.send("chat:response-chunk", chunk);
                }
            );

            chatManager.addAssistantMessage(response);

            event.sender.send("chat:response-complete");

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

            event.sender.send("chat:response-error", userMessage);


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

        // console.log("Models from AIManager:", models);

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

    ipcMain.handle("audio:transcribe", async (event, { audioData, mimeType }) => {
        try {
            const audioBuffer = Buffer.from(audioData);

            console.log(
                "🎙️ Transcribing",
                audioBuffer.length,
                mimeType
            );

            const text = await speechManager.transcribe(
                audioBuffer,
                mimeType
            );

            console.log("🎙️ Transcript:", text);

            return {
                success: true,
                text
            };

        } catch (error) {
            console.error("🎙️ Transcription error:", error);

            return {
                success: false,
                message: "Speech transcription failed. Please try again."
            };
        }
    });

    ipcMain.handle("speech:get-provider", () => {
    return {
        provider: speechManager.getProvider()
    };
});

    ipcMain.handle("speech:set-provider", (event, provider) => {
        try {
            const result =
                speechManager.setProvider(provider);

            return {
                success: true,
                provider: result.provider,
                model: result.model
            };

        } catch (error) {
            console.error(
                "Speech provider error:",
                error
            );

            return {
                success: false,
                message: error.message
            };
        }
    });

    ipcMain.handle("speech:get-model", () => {
        return {
            model: speechManager.getModel()
        };
    });

    ipcMain.handle("speech:set-model", (event, model) => {
        try {
            speechManager.setModel(model);

            return {
                success: true,
                model: speechManager.getModel()
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    });

    ipcMain.handle("speech:get-models", () => {
        return {
            models: speechManager.getModels()
        };
    });

        
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});