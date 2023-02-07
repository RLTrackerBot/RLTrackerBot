const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlink')
		.setDescription('Unlink an account (moderators only)')
        .addUserOption(option => option
            .setName('user')
            .setDescription('Select the user to unlink their account')
            .setRequired(true)),
	async execute(interaction, dbc) {
        const db = dbc.db("RLTrackerDB");
        const users = db.collection("users");
        if(!interaction.member.roles.cache.has('1067616328816537650')) return interaction.reply("You don't have permissions for this command!");
        await users.findOneAndUpdate({_id: interaction.options.getUser('user').id}, {$set: {name: null}}, {upsert: true});
        interaction.reply(`Successfully unlinked <@${interaction.options.getUser('user').id}>'s account.`);
	}
};