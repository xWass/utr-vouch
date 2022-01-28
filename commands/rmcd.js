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
        .setName('rmcd')
        .setDescription('Removes a users vouch cooldown')

        .addUserOption(option => option
            .setName('user')
            .setDescription('User to remove cooldown for.')),

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

            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
                if (interaction.user.id === "912802758359416873") return;
                await interaction.reply({
                    content: 'You can not use this.',
                    ephemeral: true
                });
            }

            db.run(`UPDATE timestamps SET ts = ? WHERE userid = ?`, [0, user.id]);
            await interaction.reply({
                content: `User's vouch cooldown removed.`,
                ephemeral: true
            });
            interaction.followUp({
                content: `${mem}, your vouch cooldown has been removed!`,
                ephemeral: false
            })

        })
    }
}