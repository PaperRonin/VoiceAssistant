import {SlashCommandBuilder} from '@discordjs/builders'
import {Client, CommandInteraction, TextChannel} from "discord.js";
import {VoiceConnection} from "@discordjs/voice";
import log from "loglevel";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice_commands')
        .setDescription('Shows all commands for voice chat')
        .setNameLocalization("ru", "команды")
        .setDescriptionLocalization("ru", "Показать список команд для голосового чата"),
    async execute(discordClient, interaction: CommandInteraction) {
        let message = ["Голосовые команды:"]
        discordClient.voiceCommands.forEach((command) => {
            if (command.description != null) {
                message.push(`"${command.voiceChannelName}" - ${command.description}`)
            }
        })
        return interaction.reply({content: message.join("\n"), ephemeral: true});
    },
};