import {Config} from "./settingsParser";

const log = require('loglevel');
const util = require('util');
const Discord = require('discord.js');
const Settings = require('settings');
const VoiceProcessor = require('voice_processing');
const Commands = require('commands')

const discordClient = new Discord.Client();

const config = new Settings().config;

function _init() {
    let voiceProcessor = new VoiceProcessor();

    discordClient.login(config.discord_token).catch(log.error);

    discordClient.on('ready', () => {
        log.info(`Logged in as ${discordClient.user.tag}!`)
    });

    Commands.guildMap = new Map();
    Commands.discordClient = discordClient;
    Commands.config = config;
    Commands.voiceProcessor = voiceProcessor;

    discordClient.on('message', async (msg) => {
        try {
            if (!('guild' in msg) || !msg.guild) return; // prevent private messages to bot
            if (!msg.content.startsWith(config.prefix)) return

            let command: string = msg.content.replace(config.prefix).split()[0].trim().toLowerCase();

            config.commands.forEach(c => {
                if (c.callName === command && Commands[command]) {
                    Commands[command](msg).catch(log.error);
                }
            });

        } catch (e) {
            log.error('discordClient message: ' + e)
            msg.reply('Error: Something went wrong, try again or contact the developers if this keeps happening.');
        }
    })

}

_init();



