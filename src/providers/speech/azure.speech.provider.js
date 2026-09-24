const sdk = require("microsoft-cognitiveservices-speech-sdk");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const os = require("os");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

class AzureSpeechProvider {
    constructor() {
        this.subscriptionKey = process.env.AZURE_SPEECH_KEY;
        this.region = process.env.AZURE_SPEECH_REGION;

        this.model = "azure-speech";
    }

    setModel(modelName) {
        this.model = modelName;
    }

    getModel() {
        return this.model;
    }

    getModels() {
        return ["azure-speech"];
    }

    async transcribe(audioBuffer) {
        if (!this.subscriptionKey || !this.region) {
            throw new Error(
                "Azure Speech credentials are not configured."
            );
        }

        const tempDir = os.tmpdir();

        const inputPath = path.join(
            tempDir,
            `clueless-${Date.now()}.webm`
        );

        const outputPath = path.join(
            tempDir,
            `clueless-${Date.now()}.wav`
        );

        try {
            fs.writeFileSync(inputPath, audioBuffer);

            await this.convertToWav(
                inputPath,
                outputPath
            );

            const speechConfig =
                sdk.SpeechConfig.fromSubscription(
                    this.subscriptionKey,
                    this.region
                );

            speechConfig.speechRecognitionLanguage =
                "en-US";

            const audioConfig =
                sdk.AudioConfig.fromWavFileInput(
                    fs.readFileSync(outputPath)
                );

            const recognizer =
                new sdk.SpeechRecognizer(
                    speechConfig,
                    audioConfig
                );

            return await new Promise(
                (resolve, reject) => {
                    recognizer.recognizeOnceAsync(
                        result => {
                            recognizer.close();

                            if (
                                result.reason ===
                                sdk.ResultReason.RecognizedSpeech
                            ) {
                                resolve(result.text);
                            } else {
                                reject(
                                    new Error(
                                        `Azure recognition failed: ${result.reason}`
                                    )
                                );
                            }
                        },
                        error => {
                            recognizer.close();
                            reject(error);
                        }
                    );
                }
            );

        } finally {
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }

            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        }
    }

    convertToWav(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioChannels(1)
                .audioFrequency(16000)
                .audioCodec("pcm_s16le")
                .format("wav")
                .on("end", resolve)
                .on("error", reject)
                .save(outputPath);
        });
    }
}

module.exports = AzureSpeechProvider;