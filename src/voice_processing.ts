import {Config, Settings} from "./settings";
import {replaceWordsWithNumbers} from "./utils";
const log = require('loglevel');
const fs = require('fs');
const vosk = require('vosk');
const prism = require('prism-media');
import {VoiceConnection, AudioReceiveStream} from "@discordjs/voice";
import {TextChannel, User, Client, Collection} from 'discord.js';

const voskFolder = "./vosk_models";

export class VoiceProcessor {
    private readonly speechModel: any;
    private config: Config

    constructor() {
        // Загружаем насторойки
        this.config = new Settings().config
        // Убираем логирование распознания речи
        vosk.setLogLevel(-1);
        // Модели: https://alphacephei.com/vosk/models
        log.info(`Загружаю речевую модель`)
        this.speechModel = new vosk.Model(`${voskFolder}/${this.config.language}`)
        log.info(`Модель загружена`)
        // Документиация: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js
    }

    getDisplayName(userId: string, user?: User) {
        return user ? `${user.username}#${user.discriminator}` : userId;
    }

    async transcribeAsync(buffer): Promise<string> {
        //Инициализация обработчика речи с загруженным ранее модулем распознания речи
        let recognizer = new vosk.Recognizer({
                model: this.speechModel,
                sampleRate: 48000
            }
        )
        //Обработчика аудиозаписи из буфера 
        await recognizer.acceptWaveformAsync(buffer);
        //Получение результата
        let result = recognizer.finalResult().text;
        //Освобождение памяти
        recognizer.free()
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
                        //Логирование результата
                        log.info(userName + ' сказал(а): ' + out)
                        await this.process(voiceConnection, textChannel, discordClient, out)
                    }
                } catch (e) {
                    log.error('Ошбибка обработки голоса: ' + e)
                }
            })

        } catch (e) {
            log.error(e);
        }
    }

    async process(voiceConnection: VoiceConnection, textChannel: TextChannel, discordClient, text: string) {
        let botCallIndex = text.indexOf(this.config.bot_name)
        if (botCallIndex == -1) return

        let textWithCommand: string = text.slice(botCallIndex)
        
        discordClient.voiceCommands.forEach((command, key) => {
            if (textWithCommand.includes(key)) {
                
                return command.executeVoice(voiceConnection, textChannel, discordClient, replaceWordsWithNumbers(textWithCommand))
            }
        })
    }
}



