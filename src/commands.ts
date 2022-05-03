import {Config} from "./settings";
import {VoiceProcessor} from "./voice_processing";
import * as discordjsVoice from "@discordjs/voice";
import {VoiceConnection} from "@discordjs/voice";

const log = require('loglevel');

let discordClient: any;
let config: Config;
let voiceProcessor: VoiceProcessor;

export async function help(msg) {
    let properties = new Array<string>()
    let currentObj = this
    do {
        Object.getOwnPropertyNames(currentObj).map(item => properties.push(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return properties .filter((item: any) => {
        return typeof currentObj[item] === 'function';
    })

    let out = '**COMMANDS:**\n'
    out += '```'
    this.forEach(item => {
        out += `${item}\n`;
    });
    out += '```' 
    return out;
}

export async function join(msg) {
    try {
        if (!msg.member.voice.channel) {
            msg.reply('Error: please join a voice channel first.')
            return
        }
        let voiceChannel: VoiceConnection = discordjsVoice.getVoiceConnection(msg.guild.id);
        
        if (voiceChannel && voiceChannel.joinConfig.channelId === msg.member.voice.channelId) {
            msg.reply('Already connected')
        }
        
        let voiceConnection = discordjsVoice.joinVoiceChannel({
            channelId: msg.member.voice.channel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator,
            selfDeaf: false,
            debug: true
        });
        
        msg.member.voice.channel.members.forEach(member => voiceConnection.receiver.subscribe(member.id))
        
        voiceConnection.playOpusPacket(Buffer.from([0xf8, 0xff, 0xfe]));

        this.voiceProcessor.voiceConnection_hook(voiceConnection, msg.channel);

        voiceConnection.on(discordjsVoice.VoiceConnectionStatus.Disconnected, async (e) => {
            if (e) log.error(e);
            try {
                await Promise.race([
                    discordjsVoice.entersState(voiceConnection, discordjsVoice.VoiceConnectionStatus.Signalling, 5_000),
                    discordjsVoice.entersState(voiceConnection, discordjsVoice.VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                voiceConnection.destroy();
            }
        })
        msg.reply('connected!')
    } catch (e) {
        log.error('connect: ' + e)
        msg.reply('Error: unable to join your voice channel.');
    }
}


export async function leave(msg) {
    let voiceChannel: VoiceConnection = discordjsVoice.getVoiceConnection(msg.guild.id);
    if (!voiceChannel) {
        msg.reply("Cannot leave because not connected.")
        return
    }

    voiceChannel.disconnect()
    msg.reply("Disconnected.")
}

export async function ping(msg) {
    msg.reply('pong')
}