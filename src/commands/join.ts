import { SlashCommandBuilder } from '@discordjs/builders'
import {DiscordGatewayAdapterCreator, VoiceConnection} from "@discordjs/voice"
import * as discordjsVoice from "@discordjs/voice"
import {CommandInteraction, TextChannel} from "discord.js"
import log from "loglevel"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join voice channel.')
        .setNameLocalization("ru", "зайди")
        .setDescriptionLocalization("ru", "Я зайду в текущий голосовой канал пользователя и начну слушать команды"),
    description: 'Я зайду в текущий голосовой канал пользователя и начну слушать команды',
    async execute(discordClient, interaction : CommandInteraction) {
        try {
            const member = interaction.guild.members.cache.get(interaction.member.user.id)
            const voiceChannel = member.voice.channel;
            
            if (!voiceChannel) {
                return interaction.reply('Ошибка: пользователь не находится в голосовом канале.')
            }
            let voiceConnection: VoiceConnection = discordjsVoice.getVoiceConnection(voiceChannel.guild.id);

            if (voiceConnection && voiceConnection.joinConfig.channelId === member.voice.channelId) {
                return interaction.reply('Ошибка: уже присоединился')
            }

            voiceConnection = discordjsVoice.joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
                selfDeaf: false
            });

            await discordjsVoice.entersState(voiceConnection, discordjsVoice.VoiceConnectionStatus.Ready, 20e3);

            voiceChannel.members.forEach(member => voiceConnection.receiver.subscribe(member.id))
            voiceConnection.playOpusPacket(Buffer.from([0xf8, 0xff, 0xfe]));
            voiceConnection.on(discordjsVoice.VoiceConnectionStatus.Disconnected, async (e) => {
                if (e) log.error(e);
                try {
                    await Promise.race([
                        discordjsVoice.entersState(voiceConnection, discordjsVoice.VoiceConnectionStatus.Signalling, 5_000),
                        discordjsVoice.entersState(voiceConnection, discordjsVoice.VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    voiceConnection.destroy();
                }
            })
            
            await interaction.reply('Присоединился!')
            
            return discordClient.voiceProcessor.voiceConnection_hook(voiceConnection, interaction.channel as TextChannel, discordClient)
        } catch (e) {
            log.error('connect: ' + e)
            return interaction.channel.send('Ошибка: не удалось войти в голосовой канал.');
        }
    },
};