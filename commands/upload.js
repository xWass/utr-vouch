const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');
const sqlite = require('sqlite3')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload the vouching database'),

    async execute(interaction) {
        let attachments = "./vouch.db"
            if (interaction.user.id !== "912802758359416873")
            return void (await interaction.reply({
                content: 'You can not use this.',
                ephemeral: true
            }));

            await interaction.reply({
                content: `Heres your database!`,
                ephemeral: false,
                files: [attachments]
            });
        }
    }