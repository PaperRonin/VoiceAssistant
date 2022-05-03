import {Config} from "./settings";

const log = require('loglevel');
const fs = require('fs');
const vosk = require('vosk');
import {VoiceConnection} from "@discordjs/voice";

const voskFolder = "./vosk_models";
let config: Config;

export class VoiceProcessor {
    private recognizers: any[];

    constructor() {
        let files: string[];
        this.recognizers = [];
        
        vosk.setLogLevel(-1);
        // MODELS: https://alphacephei.com/vosk/models
        log.info(`reading language folders from ${fs.realpathSync(voskFolder)}`)
        files = fs.readdirSync(voskFolder);

        log.info(`loading language recognizers`)
        files.forEach(file => {
            this.recognizers.push({
                file: new vosk.Recognizer({
                    model: new vosk.Model(`${voskFolder}/${file}`),
                    sampleRate: 48000
                })
            });
        });

        log.info(`language recognizers loaded`)
        // download new models if you need
        // dev reference: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js
    }

    async transcribe(buffer) {
        this.recognizers[config.language].acceptWaveform(buffer);
        let ret = this.recognizers[config.language].result().text;
        log.info('vosk:', ret)
        return ret;
    }

    voiceConnection_hook(voiceConnection: VoiceConnection, textChannel) {
        try {
            voiceConnection.receiver.subscriptions.forEach((audioStream, userssrc) => {
                let userId = userssrc
                log.info(`I'm listening to ${userId}`)
                audioStream.on('error', (e) => {
                    log.error('audioStream: ' + e)
                });
                let buffer: any =  [];
                audioStream.on('data', (data) => {
                    buffer.push(data)
                    voiceConnection.playOpusPacket(data)
                })
                audioStream.on('end', async () => {
                    log.info(`Stoped listening to ${userId}`)
                    buffer = Buffer.concat(buffer)
                    const duration = buffer.length / 48000 / 4;
                    log.info("duration: " + duration)

                    if (duration < 1.0 || duration > 19) { // 20 seconds max dur
                        log.info("TOO SHORT / TOO LONG; SKPPING")
                        return;
                    }

                    try {
                        let new_buffer = await stereo_to_mono(buffer)
                        let out = await this.transcribe(new_buffer);
                        if (out && out.length) {
                            textChannel.send(userId + ': ' + out)
                        }
                    } catch (e) {
                        log.error('tmpraw rename: ' + e)
                    }


                })
            })
        } catch (e) {
            log.error(e);
        }
    }
}

async function stereo_to_mono(input): Promise<Buffer> {
    try {
        const data = new Int16Array(input)
        const ndata = data.filter((el, idx) => idx % 2);
        return Buffer.from(ndata);
    } catch (e) {
        log.error(e)
        log.error('convert_audio: ' + e)
        throw e;
    }
}



