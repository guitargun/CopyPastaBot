'use strict';

const {breakSentence} = require('../utils');

let database;
let r;
let config;

module.exports = {
	init(data) {
		database = data.database;
		r = data.r;
		config = data.config;
	},

	async CommandHandler(message, cmd, args) {
		const inDB = await database.checkPost(args[0]);
		if (inDB === undefined) {
			message.reply('Unknown copypasta, please try a better one');
		}
		else {
			const sub = await r.getSubmission(args[0]);
			let text = await sub.selftext;
			// Edge case filtering
			if (text.length === 0) {
				text = await sub.title;
			}
			const words = breakSentence(text, config.MessageLimit);
			message.reply(words[0]);
			for (let w in words) {
				w = words[w + 1];
				if (w === undefined) {
					break;
				}
				if (w.length !== 0) {
					message.channel.send(w);
				}
			}
		}
	},
};
