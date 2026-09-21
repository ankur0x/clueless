const Groq = require("groq-sdk");

class AIManager {
    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    async generateResponse(messages) {
        const completion = await this.client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages
        });

        return completion.choices[0].message.content;
    }
}

module.exports = AIManager;