import { SlashCommandBuilder } from '@discordjs/builders'
import {Client, CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(discordClient : Client, interaction : CommandInteraction) {
        return interaction.reply('Pong!');
    },
};