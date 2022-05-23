import log from "loglevel";
import {deployCommands} from "./deploy-commands";
import {Interaction} from "discord.js";

const Discord = require('discord.js');

const {Settings} = require('./settings');
const {VoiceProcessor} = require('./voice_processing');
const {Commands} = require('./commands')

const discordClient = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING
    ]
});

const config = new Settings().config;
const commands = new Commands()

function _init() {
    log.setLevel(log.levels.INFO)

    process.on('uncaughtException', function (err) {
        log.error('Caught exception: ', err)
        setTimeout( () => {},5000)
    });
    let voiceProcessor = new VoiceProcessor();

    log.info(`loging in...`)
    discordClient.login(config.discord_token).catch(log.error);

    discordClient.on('ready', () => {
        log.info(`Logged in as ${discordClient.user.tag}!`)
        deployCommands(discordClient)
    });
    
    commands.discordClient = discordClient
    commands.config = config
    commands.voiceProcessor = voiceProcessor
    
    listenMessages()

}
function listenMessages() {
    discordClient.on('messageCreate', async (msg) => {
        try {
            if (!('guild' in msg) || !msg.guild) return; // prevent private messages to bot
            if (!msg.content.startsWith(config.prefix)) return

            let command: string = msg.content.replace(config.prefix, '').split()[0].trim().toLowerCase();
            log.info(`recieved message from channel: '${msg.guild.name}' with command: '${command}'`)

            if (commands[command]) {
                log.info(`found command: ${command}`)
                commands[command](msg).catch(log.error);
            }

        } catch (e) {
            log.error('discordClient message: ' + e)
            msg.reply('Error: Something went wrong, try again or contact the developers if this keeps happening.');
        }
    })

    discordClient.on('interactionCreate', async( interaction : Interaction) => {
        if (!interaction.isCommand()) return;

        const command = discordClient.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            log.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
}

_init()



