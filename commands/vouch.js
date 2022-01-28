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
        const toaster = interaction.guild.channels.cache.find(c => c.name === "rwt-vouches")
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

                interaction.reply({
                    content: `Vouch logged! \nYou vouched for ${mem} \nReason: ${res}`,
                    ephemeral: true
                });
                if (!toaster) return;
                toaster.send({
                    content: `${org} vouched for ${mem} \nReason: ${res}`,
                    ephemeral: false
                })
            } else {
                const num = row.vouches + 1
                let querya = `SELECT * FROM timestamps WHERE userid = ?`;
                db.get(querya, [userid], async (err, row) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (interaction.createdTimestamp - row.ts < 43200000) {
                        console.log("true")
                        interaction.reply({
                            content: `You can not use this right now! \nIf you need to vouch for someone, ask a moderator to remove your vouch cooldown.`,
                            ephemeral: true
                        });
                        return;
                    }
                    db.run(`UPDATE data SET vouches = ? WHERE userid = ?`, [num, user.id]);
                    db.run(`UPDATE reasons SET reason = ? WHERE userid = ?`, [res, user.id]);
                    db.run(`UPDATE timestamps SET ts = ? WHERE userid = ?`, [ts, userid]);
                    interaction.reply({
                        content: `Vouch logged! \nYou vouched for ${mem} \nReason: ${res}`,
                        ephemeral: true
                    });
                    if (!toaster) return;
                    toaster.send({
                        content: `${org} vouched for ${mem} \nReason: ${res}`,
                        ephemeral: false
                    })
    
                })


            }
        })
    }
}