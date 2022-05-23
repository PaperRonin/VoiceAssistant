import {SlashCommandBuilder} from '@discordjs/builders'
import {Client, CommandInteraction, TextChannel} from "discord.js";
import {VoiceConnection} from "@discordjs/voice";
import * as discordjsVoice from "@discordjs/voice";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('leave current voice channel'),
    voiceChannelName: 'выйди',
    async execute(discordClient: Client, interaction: CommandInteraction) {
        let voiceChannel: VoiceConnection = discordjsVoice.getVoiceConnection(interaction.guild.id);
        if (!voiceChannel) {
            return interaction.reply("Не присоеденен к голосовому каналу")

        }
        voiceChannel.disconnect()
        return interaction.reply({content: `Вышел из голосового канала`})
    },
    async executeVoice(voiceConnection: VoiceConnection, textChannel: TextChannel, discordClient, text: string) {
        voiceConnection.disconnect()
        return textChannel.send({content: `Вышел из голосового канала`})
    }
};