import {Config, Settings} from "./settings";

const log = require('loglevel');
const fs = require('fs');
const vosk = require('vosk');
const prism = require('prism-media');
import {VoiceConnection, AudioReceiveStream} from "@discordjs/voice";
import {TextChannel, User, Client} from 'discord.js';

const voskFolder = "./vosk_models";

export class VoiceProcessor {
    private speechModel: any;
    private config: Config

    constructor() {
        let files: string[];
        this.config = new Settings().config
        vosk.setLogLevel(-1);
        // MODELS: https://alphacephei.com/vosk/models
        log.info(`loading language models`)
        this.speechModel = new vosk.Model(`${voskFolder}/${this.config.language}`)

        log.info(`language recognizers loaded`)
        // download new models if you need
        // dev reference: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js
    }

    getDisplayName(userId: string, user?: User) {
        return user ? `${user.username}#${user.discriminator}` : userId;
    }

    async transcribeAsync(buffer): Promise<string> {
        let recognizer = new vosk.Recognizer({
                model: this.speechModel,
                sampleRate: 48000
            }
        )
        await recognizer.acceptWaveformAsync(buffer);

        let result = recognizer.finalResult().text;
        recognizer.free()
        log.info(result)
        return result;
    }

    async voiceConnection_hook(voiceConnection: VoiceConnection, textChannel: TextChannel, discordClient: Client) {
        try {

            const receiver = voiceConnection.receiver;
            const userVoiceInfo = new Map<string, {
                buffer: Buffer[],
                opusStream: AudioReceiveStream,
                decoder: any
            }>();

            receiver.speaking.on('start', async (userId) => {
                log.info(`Listening to ${this.getDisplayName(userId, discordClient?.users?.cache?.get(userId))}`)

                let opusStream: AudioReceiveStream = voiceConnection.receiver.subscribe(userId);

                let decoder = new prism.opus.Decoder({frameSize: 1920, channels: 1, rate: 48000});
                opusStream.pipe(decoder);

                userVoiceInfo.set(userId, {
                    buffer: [],
                    opusStream: opusStream,
                    decoder: decoder
                })

                decoder.on('error', (e) => {
                    log.error('audioStream: ' + e)
                });
                decoder.on('data', (data) => {
                    userVoiceInfo.get(userId).buffer.push(data)
                })
            })

            receiver.speaking.on('end', async (userId) => {
                if (userVoiceInfo.get(userId) === null)
                    return

                let userName = this.getDisplayName(userId, discordClient?.users?.cache?.get(userId))
                log.info(`Stoped listening to ${userName}`)
                userVoiceInfo.get(userId).opusStream.destroy()
                userVoiceInfo.get(userId).decoder.destroy()

                let buffer = Buffer.concat(userVoiceInfo.get(userId).buffer)
                let duration = buffer.length / 48000
                log.info("duration: " + duration)
                if (duration < 1.0 || duration > 19) {
                    log.info("TOO SHORT / TOO LONG; SKIPPING")
                    return;
                }

                try {
                    let out = await this.transcribeAsync(buffer);
                    if (out && out.length) {
                        await textChannel.send(userName + ' сказал(а): ' + out)
                    }
                } catch (e) {
                    log.error('tmpraw rename: ' + e)
                }
            })

        } catch (e) {
            log.error(e);
        }
    }
}



