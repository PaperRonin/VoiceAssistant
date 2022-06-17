import { SlashCommandBuilder } from '@discordjs/builders'
import {Client, CommandInteraction} from "discord.js";


module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Prune up to 100 messages.')
        .setNameLocalization("ru", "отчисти")
        .setDescriptionLocalization("ru", "Удаляет до 100 сообщений в текстовом чате")
        .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to prune')
            .setDescriptionLocalization("ru", "Количество сообщений для удаления")),
    description: 'Удаляет до 100 сообщений',
    async execute(discordClient : Client, interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Введите число от 1 до 100.', ephemeral: true });
        }
        
        await interaction.channel.bulkDelete(amount, true).catch(error => {
            console.error(error);
            interaction.reply({ content: 'Возникла ошибка при попытке удалить сообщения в данном канале', ephemeral: true });
        });

        return interaction.reply({ content: `Успешно удалено \`${amount}\` сообщений.`, ephemeral: true });
    },
};