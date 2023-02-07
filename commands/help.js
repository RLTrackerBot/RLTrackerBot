const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('View list of commands and their description'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
		    .setAuthor({name: `${interaction.user.tag} • Successfully linked account`, iconURL: interaction.user.avatarURL()})
		    .addFields(
				{name: '/help', value: 'Lists all commands and a description of what they do.'},
                {name: '/link', value: 'Links your account. Select your platform and write your account name for that platform.'},
				{name: '/ranks', value: 'Shows the rank of someone\'s Rocket League account, or if a parameter is missing, shows your own.'},
				{name: '/unlink', value: 'Moderation command: unlinks an account.'}
            )
		await interaction.editReply({embeds: [embed], ephemeral: true, content: ""});
	}
};