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
        .setName('rsvouch')
        .setDescription('Completely resets a users vouching information in the database')

        .addUserOption(option => option
            .setName('user')
            .setDescription('User to reset.')),

    async execute(interaction) {
        let query = `SELECT * FROM data WHERE userid = ?`;
        let db = new sqlite.Database('./vouch.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
        const user = interaction.options.getUser('user');
        const mem = interaction.options.getMember('user');
        db.get(query, [user.id], async (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                return void (await interaction.reply({
                    content: 'User not found in the db.',
                    ephemeral: true
                }));
            }
            if (!interaction.member.permissions.has('MANAGE_MESSAGES'))
                return void (await interaction.reply({
                    content: 'You can not use this.',
                    ephemeral: true
                }));

            db.run(`UPDATE data SET vouches = ? WHERE userid = ?`, [0, user.id]);
            db.run(`UPDATE reasons SET reason = ? WHERE userid = ?`, [0, user.id]);
            db.run(`UPDATE timestamps SET ts = ? WHERE userid = ?`, [0, user.id]);
            await interaction.reply({
                content: `User's vouch information reset.`,
                ephemeral: true
            });
            interaction.followUp({
                content: `${mem}, your vouch stats have been reset by a moderator!`,
                ephemeral: false
            })

        })
    }
}