const GroqSpeechProvider = require("../providers/speech/groq.speech.provider");
const AzureSpeechProvider = require("../providers/speech/azure.speech.provider");


class SpeechManager {
    constructor() {
        this.providers = {
            groq: new GroqSpeechProvider(),
            azure: new AzureSpeechProvider()

        };

        this.currentProvider = "groq";
    }

    setProvider(providerName) {
        if (!this.providers[providerName]) {
            throw new Error(
                `Unknown speech provider: ${providerName}`
            );
        }

        this.currentProvider = providerName;
    }

    getProvider() {
        return this.currentProvider;
    }

    setModel(modelName) {
        this.providers[this.currentProvider]
            .setModel(modelName);
    }

    getModel() {
        return this.providers[this.currentProvider]
            .getModel();
    }

    getModels() {
        return this.providers[this.currentProvider]
            .getModels();
    }

    async transcribe(audioBuffer, mimeType) {
        return this.providers[this.currentProvider]
            .transcribe(audioBuffer, mimeType);
    }
}

module.exports = SpeechManager;