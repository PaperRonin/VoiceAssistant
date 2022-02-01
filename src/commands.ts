import {Config} from "./settingsParser";

let guildMap: Map<any, any>;
let discordClient: any;
let config: Config;
let voiceProcessor: VoiceProcessor;

async function help(msg) {
    let out = '**COMMANDS:**\n'
    out += '```'
    this.forEach(item => {
        out += `${item}\n`;
    });
    out += '```'
    return out;
}

async function join(msg) {
    try {
        if (!msg.member.voice.channelID) {
            msg.reply('Error: please join a voice channel first.')
        } else {
            if (!guildMap.has(msg.guild.id)) {
                let voice_Channel = await discordClient.channels.fetch(msg.member.voice.channelID);
                if (!voice_Channel) return msg.reply("Error: The voice channel does not exist!");
                let text_Channel = await discordClient.channels.fetch(msg.channel.id);
                if (!text_Channel) return msg.reply("Error: The text channel does not exist!");
                let voice_Connection = await voice_Channel.join();
                voice_Connection.playOpusPacket(new Silence());
                guildMap.set(msg.guild.id, {
                    'text_Channel': text_Channel,
                    'voice_Channel': voice_Channel,
                    'voice_Connection': voice_Connection,
                    'selected_lang': 'en',
                    'debug': false,
                });
                voiceProcessor.voice_connection_hook(voice_Connection, msg.guild.id);
                voice_Connection.on('disconnect', async (e) => {
                    if (e) log.error(e);
                    guildMap.delete(msg.guild.id);
                })
                msg.reply('connected!')
            } else
                msg.reply('Already connected')
        }
    } catch (e) {
        log.error('connect: ' + e)
        msg.reply('Error: unable to join your voice channel.');
        throw e;
    }
}


async function leave(msg) {
    if (guildMap.has(msg.guild.id)) {
        let val = guildMap.get(msg.guild.id);
        if (val.voice_Channel) val.voice_Channel.leave()
        if (val.voice_Connection) val.voice_Connection.disconnect()
        guildMap.delete(msg.guild.id)
        msg.reply("Disconnected.")
    } else {
        msg.reply("Cannot leave because not connected.")
    }
}

async function debug(msg) {
    log.info('toggling debug mode')
    let val = guildMap.get(msg.guild.id);
    val.debug = !val.debug;
}

async function ping(msg) {
    msg.reply('pong')
}

async function changeLanguage(msg) {
    let val = guildMap.get(msg.guild.id);
    val.selected_lang = msg.content.replace(config.prefix).split()[1].trim().toLowerCase();
}