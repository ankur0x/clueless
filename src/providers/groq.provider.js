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

    async generateResponse(messages) {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: messages
        });

        return completion.choices[0].message.content;
    }

    
}

module.exports = GroqProvider;