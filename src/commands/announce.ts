import { SlashCommandBuilder } from '@discordjs/builders'
import {Client, CommandInteraction, TextChannel} from "discord.js";
import {VoiceConnection} from "@discordjs/voice";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Announce something to @everyone')
        .addStringOption(option => option.setName('message').setDescription('Message to announce').setRequired(true)),
    voiceChannelName: 'объяви',
    description: 'Объявляет сообщение для всех на сервере',
    async execute(discordClient : Client, interaction : CommandInteraction) {
        const message = interaction.options.getString('message');
        return interaction.reply({ content: `@everyone, ${interaction.user.username} сказал(a): ${message}` });
    },
    async executeVoice(userName : string, voiceConnection: VoiceConnection, textChannel, discordClient, text: string) {
        return textChannel.send(`@everyone, ${userName} сказал(a): ${text}`);
    },
};