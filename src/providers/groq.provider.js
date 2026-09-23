const Groq = require("groq-sdk");

class GroqProvider {
    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        this.model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
    }

    setModel(modelName) {
        this.model = modelName;
    }

    getModel() {
        return this.model;
    }

    async getModels() {
        const response = await this.client.models.list();

        return response.data
            .filter(model => model.active)
            .map(model => model.id);
    }

    async generateResponse(messages, onChunk) {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages,
            stream: true
        });

        let fullResponse = "";

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";

            if (content) {
                fullResponse += content;

                if (onChunk) {
                    onChunk(content);
                }
            }
        }

        return fullResponse;
    }

    
}

module.exports = GroqProvider;