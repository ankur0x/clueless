const { GoogleGenAI } = require("@google/genai");

class GeminiProvider {
    constructor() {
        this.client = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        this.model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    }

    setModel(modelName) {
        this.model = modelName;
    }

    getModel() {
        return this.model;
    }

    async getModels() {
        const models = [];

        const pager = await this.client.models.list();

        for await (const model of pager) {
            if (
                model.supportedActions &&
                model.supportedActions.includes("generateContent")
            ) {
                models.push(model.name.replace("models/", ""));
            }
        }

        // console.log("Gemini models:", models);

        return models;
    }

    async generateResponse(messages, onChunk) {
        const contents = messages.map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.content
                }
            ]
        }));

        const response = await this.client.models.generateContentStream({
            model: this.model,
            contents
        });

        let fullResponse = "";

        for await (const chunk of response) {
            const text = chunk.text || "";

            if (text) {
                fullResponse += text;

                if (onChunk) {
                    onChunk(text);
                }
            }
        }

        return fullResponse;
    }
}

module.exports = GeminiProvider;