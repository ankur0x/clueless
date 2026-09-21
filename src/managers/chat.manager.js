class ChatManager {
    constructor() {
        this.messages = [];
    }

    addMessage(role, content) {
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
}

module.exports = ChatManager;