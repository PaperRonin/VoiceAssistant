const log = require('loglevel');
const fs = require('fs');
const vosk = require('vosk');

const voskFolder = "vosk_models";

class VoiceProcessor {
    private recognizers: any[];
    private guildMap: Map<any, any>;

    constructor() {
        let files: string[];

        vosk.setLogLevel(-1);
        // MODELS: https://alphacephei.com/vosk/models

        fs.readdir(voskFolder, (err, fs) => {
            files = fs;
        });

        files.forEach(file => {
            this.recognizers.push({
                file: new vosk.Recognizer({
                    model: new vosk.Model(`${voskFolder}/${file}`),
                    sampleRate: 48000
                })
            });
        });

        // download new models if you need
        // dev reference: https://github.com/alphacep/vosk-api/blob/master/nodejs/index.js
    }

    async transcribe(buffer, mapKey) {
        let val = this.guildMap.get(mapKey);
        this.recognizers[val.selected_lang].acceptWaveform(buffer);
        let ret = this.recognizers[val.selected_lang].result().text;
        log.info('vosk:', ret)
        return ret;
    }
    
    voice_connection_hook(voiceConnection, guildId) {
        voiceConnection.on('speaking', async (user, speaking) => {
            if (speaking.bitfield == 0 || user.bot) {
                return
            }
            log.info(`I'm listening to ${user.username}`)
            // this creates a 16-bit signed PCM, stereo 48KHz stream
            const audioStream = voiceConnection.receiver.createStream(user, {mode: 'pcm'})
            audioStream.on('error', (e) => {
                log.error('audioStream: ' + e)
            });
            let buffer: any = [];
            audioStream.on('data', (data) => {
                buffer.push(data)
            })
            audioStream.on('end', async () => {
                buffer = Buffer.concat(buffer)
                const duration = buffer.length / 48000 / 4;
                log.info("duration: " + duration)

                if (duration < 1.0 || duration > 19) { // 20 seconds max dur
                    log.info("TOO SHORT / TOO LONG; SKPPING")
                    return;
                }

                try {
                    let new_buffer = await stereo_to_mono(buffer)
                    let out = await this.transcribe(new_buffer, guildId);
                    if (out != null)
                        if (out && out.length) {
                            let val = this.guildMap.get(guildId);
                            val.text_Channel.send(user.username + ': ' + out)
                        }
                } catch (e) {
                    log.error('tmpraw rename: ' + e)
                }


            })
        })
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



