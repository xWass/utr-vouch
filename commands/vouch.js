const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');
const sqlite = require('sqlite3')
console.log("Someone just sent a vouch command.")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Select a member to vouch.')

        .addUserOption(option => option
            .setName('user')
            .setDescription('User to vouch for.'))

        .addStringOption(option => option
            .setName('reason')
            .setDescription('Why are you vouching them?')),

    async execute(interaction) {
        let userid = interaction.user.id;
        let ts = interaction.createdTimestamp
        let query = `SELECT * FROM data WHERE userid = ?`;
        let db = new sqlite.Database('./vouch.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
        const user = interaction.options.getUser('user');
        const mem = interaction.options.getMember('user');
        const res = interaction.options.getString('reason');
        const org = interaction.user.tag
        // const toaster = interaction.guild.channels.cache.find(c => c.name === vouches)
        db.get(query, [user.id], async (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            if (row === undefined) {
                let insertdata = db.prepare(`INSERT INTO data VALUES(?,?)`);
                insertdata.run(user.id, 1);
                insertdata.finalize();
                let insertRES = db.prepare(`INSERT INTO reasons VALUES(?,?)`);
                insertRES.run(user.id, res);
                insertRES.finalize();
                let insertTS = db.prepare(`INSERT INTO timestamps VALUES(?,?)`);
                insertTS.run(userid, ts);
                insertTS.finalize();

                console.log(`Heres what was in their command: \nUser they vouched for: ${mem} \nReason they vouched: ${res}`)

                await interaction.reply({
                    content: 'Added to db',
                    ephemeral: true
                })
                interaction.followUp({
                    content: `${org} vouched for ${mem} \nReason: ${res}`,
                    ephemeral: false
                });
            } else {
                let num = row.vouches + 1
                db.run(`UPDATE data SET vouches = ? WHERE userid = ?`, [num, user.id]);
                db.run(`UPDATE data SET reasons = ? WHERE userid = ?`, [res, user.id]);
                db.run(`UPDATE data SET timestamps = ? WHERE userid = ?`, [res, userid]);
                interaction.reply({
                    content: `${org} vouched for ${mem} \nReason: ${res}`,
                    ephemeral: false
                });
            }
        })
    }
}