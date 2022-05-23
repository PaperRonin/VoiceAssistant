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
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        discordClient.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '9' }).setToken(config.discord_token);

    discordClient.guilds.cache.forEach(guild => {
        log.info(config.app_id)
        log.info(guild.id)
        rest.put(Routes.applicationGuildCommands(config.app_id, guild.id), { body: commands })
            .then(() => log.info(`Updated commands in guild ${guild.name}#${guild.id}`))
            .catch(log.error);

        
    })
}