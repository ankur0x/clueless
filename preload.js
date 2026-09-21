const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("app", {
    startSession: () => {
        return ipcRenderer.invoke("session:start");
    },

    stopSession: () => {
        return ipcRenderer.invoke("session:stop");
    },

    getSessionState: () => {
        return ipcRenderer.invoke("session:get-state");
    },

    sendMessage: (message) => {
        return ipcRenderer.invoke("chat:send", message);
    },

    getMessages: () => {
        return ipcRenderer.invoke("chat:get-messages");
    },

    setAIProvider: (provider) => {
        return ipcRenderer.invoke("ai:set-provider", provider);
    },

    getAIProvider: () => {
        return ipcRenderer.invoke("ai:get-provider");
    },

    setAIModel: (model) => {
        return ipcRenderer.invoke("ai:set-model", model);
    },

    getAIModels: () => {
        return ipcRenderer.invoke("ai:get-models");
    },
});