const GroqProvider = require("../providers/groq.provider");
const GeminiProvider = require("../providers/gemini.provider");

class AIManager {
    constructor() {
        this.providers = {
            groq: new GroqProvider(),
            gemini: new GeminiProvider()
        };

        this.currentProvider = "groq";

        this.modelCache = {};
    }

    async setProvider(providerName) {
        const provider = this.providers[providerName];

        if (!provider) {
            throw new Error(`Unknown AI provider: ${providerName}`);
        }

        // Fetch models before changing the active provider
        const models =
            this.modelCache[providerName] ||
            await provider.getModels();

        this.modelCache[providerName] = models;

        if (models.length === 0) {
            throw new Error(`No available models for ${providerName}`);
        }

        const currentModel = provider.getModel();

        // Select a valid model for the new provider
        const selectedModel = models.includes(currentModel)
            ? currentModel
            : models[0];

        provider.setModel(selectedModel);

        // Update the active provider only after validation
        this.currentProvider = providerName;

        return {
            provider: this.currentProvider,
            model: provider.getModel(),
            models: models
        };
    }

    getProvider() {
        return this.currentProvider;
    }

    async setModel(modelName) {
        const provider = this.providers[this.currentProvider];

        const models = await this.getModels();

        if (!models.includes(modelName)) {
            throw new Error(
                `Model "${modelName}" is not available for provider "${this.currentProvider}".`
            );
        }

        provider.setModel(modelName);

        return {
            provider: this.currentProvider,
            model: provider.getModel()
        };
    }

    getModel() {
        const provider = this.providers[this.currentProvider];

        return provider.getModel();
    }

    async getModels() {
        const provider = this.providers[this.currentProvider];

        if (this.modelCache[this.currentProvider]) {
            return this.modelCache[this.currentProvider];
        }

        const models = await provider.getModels();

        this.modelCache[this.currentProvider] = models;

        return models;
    }

    async refreshModels() {
        const provider = this.providers[this.currentProvider];

        const models = await provider.getModels();

        this.modelCache[this.currentProvider] = models;

        return models;
    }

    async generateResponse(messages, onChunk) {
        const provider = this.providers[this.currentProvider];

        return provider.generateResponse(messages, onChunk);
    }
}

module.exports = AIManager;