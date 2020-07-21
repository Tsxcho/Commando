const { stripIndents } = require('common-tags');
const Command = require('../base');

module.exports = class ListGroupsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'groups',
			aliases: ['list-groups', 'show-groups'],
			group: 'commands',
			memberName: 'groups',
			description: 'Lists all command groups.',
			details: 'Only administrators may use this command.',
			guarded: true,
			format: "groups",
			examples: ["groups"]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg) {
		return msg.channel.send({embed: {
			description: `
			__**Groups**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Enabled' : 'Disabled'}`
			).join('\n')}
		`,
		color: "#55A9D9"
		}});
	}
};
