class SessionManager {
    constructor() {
        this.active = false;
    }

    start() {
        this.active = true;
    }

    stop() {
        this.active = false;
    }

    isActive() {
        return this.active;
    }
}

module.exports = SessionManager;