class SessionManager {
    constructor() {
        this.active = false;
        this.sessionId = null;
    }

    start() {
        this.active = true;
        this.sessionId = crypto.randomUUID();

        return this.sessionId;
    }

    stop() {
        this.active = false;
    }

    isActive() {
        return this.active;
    }

    getSessionId() {
        return this.sessionId;
    }
}

module.exports = SessionManager;