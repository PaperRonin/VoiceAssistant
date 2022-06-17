import { SlashCommandBuilder } from '@discordjs/builders'
import {Client, CommandInteraction} from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setNameLocalization("ru", "\u043c\u0430\u0440\u043a\u043e")
        .setDescriptionLocalization("ru", "Поло!"),
    async execute(discordClient : Client, interaction : CommandInteraction) {
        return interaction.reply(locales.get(interaction.locale));
    },
};

const locales = new Map<string,string >()
    .set("ru", "Поло!")
    .set("en-US", "Pong!")