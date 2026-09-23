class ChatManager {
    constructor() {
        this.messages = [];
        this.sessionId = null;
    }

    startSession(sessionId) {
        this.sessionId = sessionId;
        this.messages = [];
    }

    addMessage(role, content) {
        if (!this.sessionId) {
            throw new Error("No active chat session.");
        }

        this.messages.push({
            role,
            content
        });
    }

    addAssistantMessage(content) {
        this.addMessage("assistant", content);
    }

    getMessages() {
        return this.messages;
    }

    clearMessages() {
        this.messages = [];
    }

    getSessionId() {
        return this.sessionId;
    }
}

module.exports = ChatManager;