import {Config} from "./settings";
import {VoiceProcessor} from "./voice_processing";
const log = require('loglevel');
const { joinVoiceChannel } = require('@discordjs/voice');

let guildMap: Map<any, any>;
let discordClient: any;
let config: Config;
let voiceProcessor: VoiceProcessor; 

export async function help(msg) {
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
        if (!this.guildMap.has(msg.guild.id)) {
            let voice_Connection = joinVoiceChannel({
                channelId: msg.member.voice.channel.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator,
            });
            
            //let voice_Connection = await this.discordClient.getVoiceConnection(msg.guild.id);
            voice_Connection.playOpusPacket(Buffer.from([0xf8, 0xff, 0xfe]));
            this.guildMap.set(msg.guild.id, {
                'voice_Channel': msg.member.voice.channelID,
                'voice_Connection': voice_Connection,
                'selected_lang': 'en',
                'debug': false,
            });
            this.voiceProcessor.voice_connection_hook(voice_Connection, msg.guild.id);
            voice_Connection.on('disconnect', async (e) => {
                if (e) log.error(e);
                this.guildMap.delete(msg.guild.id);
            })
            msg.reply('connected!')
        } else
            msg.reply('Already connected')
        
    } catch (e) {
        log.error('connect: ' + e)
        msg.reply('Error: unable to join your voice channel.');
        throw e;
    }
}


export async function leave(msg) {
    if (this.guildMap.has(msg.guild.id)) {
        let val = this.guildMap.get(msg.guild.id);
        if (val.voice_Channel) val.voice_Channel.leave()
        if (val.voice_Connection) val.voice_Connection.disconnect()
        this.guildMap.delete(msg.guild.id)
        msg.reply("Disconnected.")
    } else {
        msg.reply("Cannot leave because not connected.")
    }
}

export async function debug(msg) {
    log.info('toggling debug mode')
    let val = this.guildMap.get(msg.guild.id);
    val.debug = !val.debug;
}

export async function ping(msg) {
    msg.reply('pong')
}

export async function changeLanguage(msg) {
    let val = this.guildMap.get(msg.guild.id);
    val.selected_lang = msg.content.replace(this.config.prefix).split()[1].trim().toLowerCase();
}