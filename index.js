const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const { clientId, guildId } = require('./config.json');
const sqlite = require('sqlite3')


const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const commands = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
require("dotenv").config();
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error)
	}
})();

client.once('ready', async () => {
	for (const file of commandFiles) {
		console.log(`Loaded ${file}!`);
	}
});



client.once("ready", async function () {
	console.log(client.user.username + " is ready!");
	client.user.setActivity("to utr vouches..", {
		type: "LISTENING"
	});
	let db = new sqlite.Database('./vouch.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
	db.run(`CREATE TABLE IF NOT EXISTS data(userid INTEGER NOT NULL, vouches INTEGER NOT NULL)`);
	db.run(`CREATE TABLE IF NOT EXISTS reasons(userid INTEGER NOT NULL, reason TEXT NOT NULL)`);
	db.run(`CREATE TABLE IF NOT EXISTS timestamps(userid INTEGER NOT NULL, ts INTEGER NOT NULL)`);
});


for (const file of commandFiles) {
	let command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.TOKEN);
