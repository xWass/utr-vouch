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
        .setName('stats')
        .setDescription('View a users total vouches and last reason for vouch')

        .addUserOption(option => option
            .setName('user')
            .setDescription('User to view.')),

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
            let vc = row.vouches
            let querya = `SELECT * FROM reasons WHERE userid = ?`;
            db.get(querya, [user.id], async (err, row) => {
                if (err) {
                    console.log(err);
                    return;
                }
                await interaction.reply({
                    content: `User: ${user.tag} \nNumber of vouches: ${vc} \nLast vouch reason: ${row.reason}`,
                    ephemeral: false
                });
    
            })
        })
    }
}