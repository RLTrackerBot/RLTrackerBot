const fs = require('fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const {DB_URL, TOKEN} = process.env;
const { MongoClient } = require("mongodb");
const dbc = new MongoClient(DB_URL);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction, dbc);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'We couldn\'t run this command, try again later.', ephemeral: true });
	}
});

client.once(Events.ClientReady, bot => {
	console.log('RL Tracker is online!');
});

async function connect() {
	try {
		await dbc.connect();
		await client.login(TOKEN);
		console.log("Connected to MongoDB and Discord");
	} catch(error) {
		console.error(error)
	}
}
connect().catch(console.dir);