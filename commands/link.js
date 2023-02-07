const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const pup = require('puppeteer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link your account')
		.addStringOption(name => name
			.setName('platform')
			.setDescription('Search with username or Steam ID')
			.setRequired(true)
			.addChoices(
				{name: 'Epic', value: 'epic'},
				{name: 'Playstation', value: 'psn'},
				{name: 'Xbox', value: 'xbl'},
				{name: 'Steam', value: 'steam'},
				{name: 'Switch', value: 'switch'}))
		.addStringOption(name => name
            .setName('name-or-id')
            .setDescription('Search with username')
			.setRequired(true)),
	async execute(interaction, dbc) {
		await interaction.deferReply();
		const db = dbc.db("RLTrackerDB");
        const users = db.collection("users");
        const user = await users.findOne({_id: interaction.user.id})
        if(user.name !== null) return interaction.editReply("You have already linked your account, and you are not allowed to relink it again. This is done in order to discourage people faking their ranks. If you need to relink it or think this is a mistake, ping a moderator.");
		let name = interaction.options.getString('name-or-id');
		const browser = await pup.launch({headless: false, waitUntil: 'domcontentloaded'});
		const page = await browser.newPage();

		try {
        	await Promise.all([
				page.goto(`https://rocketleague.tracker.network/rocket-league/profile/${interaction.options.getString('platform')}/${name}/overview`, {waitUntil: "domcontentloaded",}),
            	page.waitForSelector('#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(7) > td.name > div.rank', { visible: true }),
        	]);

			const duel = await page.evaluate(() => {
                var playlist = document.querySelector('#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(1) > td.name > div.playlist');
                var count = 1
                while(playlist.innerText.trimEnd() !== 'Ranked Duel 1v1') {
                    count++;
                    playlist = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.playlist`);
                    if(playlist == null) break;
                }
                const tag = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.rank`);
                if(tag) return tag.innerText;
                else return 'Unranked Division 1'
            });   

            const  doubles = await page.evaluate(() => {
                var playlist = document.querySelector('#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(1) > td.name > div.playlist');
                var count = 1
                while(playlist.innerText.trimEnd() !== 'Ranked Doubles 2v2') {
                    count++;
                    playlist = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.playlist`);
                    if(playlist == null) break;
                }
                const tag = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.rank`);
                if(tag) return tag.innerText;
                else return 'Unranked Division 1'
            });

            const standard = await page.evaluate(() => {
                var playlist = document.querySelector('#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(1) > td.name > div.playlist');
                var count = 1
                while(playlist.innerText.trimEnd() !== 'Ranked Standard 3v3') {
                    count++;
                    playlist = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.playlist`);
                    if(playlist == null) break;
                }
                const tag = document.querySelector(`#app > div.trn-wrapper > div.trn-container > div > main > div.content.no-card-margin > div.site-container.trn-grid.trn-grid--vertical.trn-grid--small > div.trn-grid__sidebar-left > div > div > div:nth-child(1) > div.trn-table__container > table > tbody > tr:nth-child(${count}) > td.name > div.rank`);
                if(tag) return tag.innerText;
                else return 'Unranked Division 1'
            });  

			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setAuthor({name: `${interaction.user.tag} • Successfully linked account`, iconURL: interaction.user.avatarURL()})
				.setFooter({text: `Account set to ${interaction.options.getString('name-or-id')}`})
			
			await interaction.editReply({embeds: [embed], ephemeral: true, content: ""});

			let member = interaction.guild.members.cache.get(interaction.user.id).roles;
			if (member.cache.has('1063868529314639993')) member.remove('1063868529314639993');
			if (member.cache.has('1063868723989069824')) member.remove('1063868723989069824');
			if (member.cache.has('1063868767538528406')) member.remove('1063868767538528406');
			if (member.cache.has('1063868797108363396')) member.remove('1063868797108363396');
			if (member.cache.has('1063868845787455628')) member.remove('1063868845787455628');
			if (member.cache.has('1063868892579119134')) member.remove('1063868892579119134');
			if (member.cache.has('1063868920580292648')) member.remove('1063868920580292648');
			if (member.cache.has('1063868954516398140')) member.remove('1063868954516398140');
			if (member.cache.has('1063868990465769493')) member.remove('1063868990465769493');
			if (member.cache.has('1063869012192284794')) member.remove('1063869012192284794');
			if (member.cache.has('1063869043360149586')) member.remove('1063869043360149586');
			if (member.cache.has('1063869210721267742')) member.remove('1063869210721267742');
			if (member.cache.has('1063869243839479940')) member.remove('1063869243839479940');
			if (member.cache.has('1063869278287298601')) member.remove('1063869278287298601');
			if (member.cache.has('1063869335170461726')) member.remove('1063869335170461726');
			if (member.cache.has('1063869359396757544')) member.remove('1063869359396757544');
			if (member.cache.has('1063869381601415188')) member.remove('1063869381601415188');
			if (member.cache.has('1063869409933938769')) member.remove('1063869409933938769');
			if (member.cache.has('1063869432046293002')) member.remove('1063869432046293002');
			if (member.cache.has('1063869474710753400')) member.remove('1063869474710753400');
			if (member.cache.has('1063869499419394189')) member.remove('1063869499419394189');
			if (member.cache.has('1063869525298249822')) member.remove('1063869525298249822');
            if (member.cache.has('1063899177467265024')) member.remove('1063899177467265024');
            
            const rank = {
                "Supersonic Legend": 0,
                "Grand Champion III": 1,
                "Grand Champion II": 2,
                "Grand Champion I": 3,
                "Champion III": 4,
                "Champion II": 5,
                "Champion I": 6,
                "Diamond III": 7,
                "Diamond II": 8,
                "Diamond I": 9,
                "Platinum III": 10,
                "Platinum II": 11,
                "Platinum I": 12,
                "Gold III": 13,
                "Gold II": 14,
                "Gold I": 15,
                "Silver III": 16,
                "Silver II": 17,
                "Silver I": 18,
                "Bronze III": 19,
                "Bronze II": 20,
                "Bronze I": 21,
                "Unranked": 22
            };

            const rankRoleMap = {
                [rank["Supersonic Legend"]]: "1063868529314639993",
                [rank["Grand Champion III"]]: "1063868723989069824",
                [rank["Grand Champion II"]]: "1063868767538528406",
                [rank["Grand Champion I"]]: "1063868797108363396",
                [rank["Champion III"]]: "1063868845787455628",
                [rank["Champion II"]]: "1063868892579119134",
                [rank["Champion I"]]: "1063868920580292648",
                [rank["Diamond III"]]: "1063868954516398140",
                [rank["Diamond II"]]: "1063868990465769493",
                [rank["Diamond I"]]: "1063869012192284794",
                [rank["Platinum III"]]: "1063869043360149586",
                [rank["Platinum II"]]: "1063869210721267742",
                [rank["Platinum I"]]: "1063869243839479940",
                [rank["Gold III"]]: "1063869278287298601",
                [rank["Gold II"]]: "1063869335170461726",
                [rank["Gold I"]]: "1063869359396757544",
                [rank["Silver III"]]: "1063869381601415188",
                [rank["Silver II"]]: "1063869409933938769",
                [rank["Silver I"]]: "1063869432046293002",
                [rank["Bronze III"]]: "1063869474710753400",
                [rank["Bronze II"]]: "1063869499419394189",
                [rank["Bronze I"]]: "1063869525298249822",
                [rank["Unranked"]]: "1063899177467265024",
            };

            const userRanks = [standard.substring(0, standard.indexOf(" D")), doubles.substring(0, doubles.indexOf(" D")), duel.substring(0, duel.indexOf(" D"))];
            const highestRankId = Math.min(...userRanks.map((name) => rank[name]).filter((idx) => idx !== undefined));

            if (rankRoleMap[highestRankId]) member.add(rankRoleMap[highestRankId]);
			await browser.close();

            await users.findOneAndUpdate({_id: interaction.user.id}, {$set: {name: name, platform: interaction.options.getString('platform')}}, {upsert: true});
		} catch (error) {
			await browser.close();
			await interaction.editReply({content: "We couldn't find that account. If you're looking for a Steam account, make sure to provide the Steam ID and not the Steam username.\nhttps://help.steampowered.com/en/faqs/view/2816-BE67-5B69-0FEC", embeds: []});
			console.error(error);
		}
	}
};