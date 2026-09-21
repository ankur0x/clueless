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

    async generateResponse(messages) {
        const contents = messages.map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.content
                }
            ]
        }));

        const maxRetries = 3;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.client.models.generateContent({
                    model: this.model,
                    contents
                });

                return response.text;

            } catch (error) {
                const status = error.status;

                if (status !== 503 || attempt === maxRetries) {
                    throw error;
                }

                const delay = Math.pow(2, attempt) * 1000;

                console.log(
                    `Gemini unavailable. Retrying in ${delay / 1000}s...`
                );

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

module.exports = GeminiProvider;