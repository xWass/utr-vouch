const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Select a member to vouch.')

        .addUserOption(option => option
            .setName('user')
            .setDescription('User to vouch for.)'))

        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why are you vouching them?')),

    async execute(interaction) {

        const user = interaction.options.getUser('user');
        const mem = interaction.options.getMember('user');
        const res = interaction.options.getString('reason');

        
        interaction.reply({
            content: `${mem.tag} vouched for "${res}"`,
            ephemeral: true
        });
    }
}