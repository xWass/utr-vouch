const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageActionRow,
    MessageButton
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Select a member to soft-ban them. (This deletes their messages from the last 7 days.)')

        .addUserOption(option => option
            .setName('user')
            .setDescription('The member to softban. (Clears past 7 days of their messages)'))

        .addStringOption(option => option
            .setName('invite')
            .setDescription('Invite the user back? (y/n)')),

    async execute(interaction) {

        const user = interaction.options.getUser('user');
        const mem = interaction.options.getMember('user');
        const inv = interaction.options.getString('invite');
        console.log(inv)
        if (!interaction.member.permissions.has('BAN_MEMBERS'))
            return void (await interaction.reply({
                content: 'You do not have the `BAN_MEMBERS` permission.',
                ephemeral: true
            }));

        if (!interaction.guild.me.permissions.has('BAN_MEMBERS'))
            return void (await interaction.reply({
                content: 'I do not have the `BAN_MEMBERS` permission.',
                ephemeral: true
            }));

        if (!mem.bannable) {
            interaction.reply({
                content: `I can not ban ${user.tag}.`,
                ephemeral: false,
            })
            return;
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('yes')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('no')
                    .setLabel('Cancel')
                    .setStyle('DANGER')
            );
        await interaction.reply({
            content: `Are you sure you want to ban ${user.tag}?`,
            components: [row],
            ephemeral: true
        });
        const response = await interaction.channel
            .awaitMessageComponent({
                filter: (i) => {
                    const isInteractionUser = i.user.id === interaction.user.id;
                    if (!isInteractionUser) {
                        i.followUp({
                            content: "You can't use this!",
                            ephemeral: true
                        });
                        return false;
                    }
                    row.components[0].setDisabled(true);
                    row.components[1].setDisabled(true);
                    return i.customId === 'yes' || i.customId === 'no';
                },
                time: 15000
            })
            .catch(() => null);
        if (response === null)
            return void (await interaction.followUp({
                content: 'Time out! Operation cancelled.',
                ephemeral: true
            }));
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(true);
        await response.update({
            components: [row]
        });


        if (response.customId === 'yes') {
            if (inv === null) {
                await interaction.guild.members.ban(user.id, {
                    days: 7
                })
                await interaction.guild.bans.remove(user.id)
                await interaction.followUp({
                    content: `${user} soft-banned.`,
                    ephemeral: false
                });
            } else if (inv === "y") {
                let invite = await interaction.channel.createInvite({
                    maxAge: 604800,
                    maxUses: 1
                 })
                // await send invite here
                await user.send({
                    content: `You were softbanned. Heres an invite back: ${invite}`,
                    ephemeral: false
                })
                await interaction.guild.members.ban(user.id, {
                    days: 7
                })
                await interaction.guild.bans.remove(user.id)
                await interaction.followUp({
                    content: `${user} soft-banned and re-invited`,
                    ephemeral: false
                });
                return;
            } else if (inv === "n") {
                await interaction.guild.members.ban(user.id, {
                    days: 7
                })
                await interaction.guild.bans.remove(user.id)
                await interaction.followUp({
                    content: `${user} soft-banned, not re-invited.`,
                    ephemeral: false
                });
                return;
            } else {
                await interaction.guild.members.ban(user.id, {
                    days: 7
                })
                await interaction.guild.bans.remove(user.id)
                await interaction.followUp({
                    content: `${user} soft-banned, not re-invited.`,
                    ephemeral: false
                });
                return;

            }
        } else
            await interaction.followUp({
                content: 'Cancelled!',
                ephemeral: true
            });
    }
}
