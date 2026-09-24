const Groq = require("groq-sdk");

class GroqSpeechProvider {
    constructor() {
        this.client = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        this.model =
            process.env.GROQ_STT_MODEL ||
            "whisper-large-v3-turbo";
    }

    setModel(modelName) {
        this.model = modelName;
    }

    getModel() {
        return this.model;
    }

    getModels() {
        return [
            "whisper-large-v3-turbo",
            "whisper-large-v3"
        ];
    }

    async transcribe(audioBuffer, mimeType) {
        const extension = mimeType.includes("webm")
            ? "webm"
            : "wav";

        const file = new File(
            [audioBuffer],
            `recording.${extension}`,
            {
                type: mimeType
            }
        );

        const transcription =
            await this.client.audio.transcriptions.create({
                file,
                model: this.model,
                language: "en",
                response_format: "json",
                temperature: 0
            });

        return transcription.text;
    }
}

module.exports = GroqSpeechProvider;