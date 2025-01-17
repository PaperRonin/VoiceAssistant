import log from "loglevel";
import {Collection} from "discord.js";
import {Settings} from "./settings";

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

export function deployCommands(discordClient){
    log.info(`Обновляю команды на серверах`)
    const config = new Settings().config;
    discordClient.commands = new Collection()
    discordClient.voiceCommands = new Collection()
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.hasOwnProperty('executeVoice'))
        {
            discordClient.voiceCommands.set(command.voiceChannelName || command.data.name, command)
        }
        discordClient.commands.set(command.data.name, command)
        commands.push(command.data.toJSON());
    }
    
    const rest = new REST({ version: '9' }).setToken(config.discord_token);
    
    discordClient.guilds.cache.forEach(guild => {
        rest.put(Routes.applicationGuildCommands(config.app_id, guild.id), { body: commands })
            .then(() => log.info(`Обновил команды для сервера ${guild.name}#${guild.id}`))
            .catch(log.error)
    })
}