import { SlashCommandBuilder } from '@discordjs/builders'
import {Client, CommandInteraction, TextChannel} from "discord.js";
import {VoiceConnection} from "@discordjs/voice";
import log from "loglevel";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them (but not really).')
        .addUserOption(option => option.setName('target').setDescription('The member to kick')),
    voiceChannelName: 'выгони',
    async execute(discordClient : Client, interaction : CommandInteraction) {
        const user = interaction.options.getUser('target');
        return interaction.reply({ content: `You wanted to kick: ${user.username}`, ephemeral: true });
    },
    async executeVoice(voiceConnection: VoiceConnection, textChannel, discordClient, text: string) {
        const list = discordClient.guilds.cache.get(textChannel.guild.id)
        list.members.cache.forEach(member => {
            let name = member?.nickname || member.user.username
            if (text.includes(member.user.discriminator)) 
                textChannel.send(`собираюсь кикнуть: ${name}#${member.user.discriminator}`)
        })
        return
    },
};