import {SlashCommandBuilder} from '@discordjs/builders'
import {Client, CommandInteraction, TextChannel} from "discord.js";
import {VoiceConnection} from "@discordjs/voice";
import log from "loglevel";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them (turned off for test purposes).')
        .addUserOption(option => option.setName('target').setDescription('The member to kick')
            .setDescriptionLocalization("ru", "Пользователь, которого требуется выгнать"))
        .setNameLocalization("ru", "выгони")
        .setDescriptionLocalization("ru", "Выгнать пользователя с сервера"),
    voiceChannelName: 'выгони',
    description: 'Выгнать пользователя с сервера',
    async execute(discordClient: Client, interaction: CommandInteraction) {
        const user = interaction.options.getUser('target');
        return interaction.reply({content: `${interaction.user.username} Cобирался выгнать: ${user.username}`, ephemeral: true});
    },
    async executeVoice(userName: string, voiceConnection: VoiceConnection, textChannel, discordClient, text: string) {
        const list = discordClient.guilds.cache.get(textChannel.guild.id)
        list.members.cache.forEach(member => {
            let name = member?.nickname || member.user.username
            if (text.includes(member.user.discriminator))
                textChannel.send(`${userName} Cобирался выгнать: ${name}#${member.user.discriminator}`)
        })
        return
    },
};