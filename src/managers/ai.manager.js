const GroqProvider = require("../providers/groq.provider");
const GeminiProvider = require("../providers/gemini.provider");

class AIManager {
    constructor() {
        this.providers = {
            groq: new GroqProvider(),
            gemini: new GeminiProvider()
        };

        this.currentProvider = "groq";
    }

    setProvider(providerName) {
        if (!this.providers[providerName]) {
            throw new Error(`Unknown AI provider: ${providerName}`);
        }

        this.currentProvider = providerName;
    }

    getProvider() {
        return this.currentProvider;
    }

    setModel(modelName) {
        const provider = this.providers[this.currentProvider];

        provider.setModel(modelName);
    }

    getModel() {
        const provider = this.providers[this.currentProvider];

        return provider.getModel();
    }

    async getModels() {
        const provider = this.providers[this.currentProvider];

        return provider.getModels();
    }
    

    async generateResponse(messages) {
        const provider = this.providers[this.currentProvider];

        return provider.generateResponse(messages);
    }
}

module.exports = AIManager;