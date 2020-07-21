const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');
const { MessageEmbed } = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				const messages = [];
				try {
					let commandInfo = new MessageEmbed()
					.setColor(`#55A9D9`)
					.setTitle(`**${String(commands[0].name).substr(0,1).toUpperCase() + String(commands[0].name).substr(1)}** Command: `)
					commandInfo.addField(`**Usage:** `, `${commands[0].format ? ` ${commands[0].format}` : ''}`)
					if(commands[0].details) commandInfo.addField(`**Description:**`, `${commands[0].details}`);
					if(commands[0].aliases.length > 0) commandInfo.addField(`**Aliases:**`, `${commands[0].aliases.join(', ')}`);
					if(commands[0].examples) commandInfo.addField(`**Examples:**`, `${commands[0].examples.join('\n')}`);
					messages.push(await msg.channel.send(commandInfo));
				} catch(err) {
					messages.push(await msg.reply('Unable to send help!'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
			try {
				let helpEmbed = new MessageEmbed()
					.setTitle(`Mayumi Help Docs:`)
					.setColor(`#55A9D9`)
					.setDescription(
						stripIndents`
						${oneLine`
							To run a command in ${msg.guild ? msg.guild.name : 'any server'},
							use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
							For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						`}
						To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
	
						Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
						Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.`
					)
				groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))).map(grp => {
						helpEmbed.addField(
							`**${grp.name}**`, 
							`${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))).map(cmd => 
								`🢒 **\`${msg.guild ? msg.guild.commandPrefix : ''}${cmd.name}\`:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''
							}`).join('\n')}`)
				});
				messages.push(await msg.author.send(helpEmbed))
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
			} catch(err) {
				console.log(err)
				messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
			}
			return messages;
		}
	}
};
