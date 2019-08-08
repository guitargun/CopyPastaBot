/* eslint-disable node/no-missing-require */
/* eslint-disable linebreak-style */
'use strict';

const textToSpeech = require('@google-cloud/text-to-speech');
const streamifier = require('streamifier');
const prism = require('prism-media');
const {breakSentence, isImage, isVideo, article, ssmlValidate, urlExtraction, censorText} = require('../utils');
const defaultTTS = {languageCode: 'en-US', ssmlGender: 'NEUTRAL'};
const settingsTTS = {languageCode: defaultTTS.languageCode, ssmlGender: defaultTTS.ssmlGender};

let database;
let r;
let client;
let queued = [];

module.exports = {
	init(data) {
		database = data.database;
		r = data.r;
		client = data.client;
	},

	async commandHandler(message, cmd, args) {
		const vc = message.author.lastMessage.member.voiceChannelID;

		if (vc === null || vc === undefined) {
			message.reply('You have to be in a voice channel to suffer my pain!!');
			return;
		}

		// stop and skip commands
		if (cmd === 'stop') {
			queued = [];
			if (client.voiceConnections.get(message.guild.id) !== undefined) {
				client.voiceConnections.get(message.guild.id).disconnect();
			}
			return;
		}
		else if (cmd === 'skip') {
			if (client.voiceConnections.get(message.guild.id) !== undefined) {
				client.voiceConnections.get(message.guild.id).disconnect();
				if (queued.length !== 0) {
					const next = queued.pop();
					this.playText(next.text, next.vc);
				}
			}
			return;
		}

		let sub;
		let text;
		switch (args[0]) {
			case 'post':
				sub = await r.getSubmission(args[1]);
				text = await sub.selftext;
				// some edge case filtering
				if (text.length === 0) {
					text = await sub.title;
					const url = await sub.url;
					if (url.length !== 0 && !isImage(url) && !isVideo(url)) {
						text = await article(url, 'text');
					}
				}

				if (await database.checkPost(args[1]) === undefined) {
					database.addPost(args[1], await sub.title);
				}
				break;
			case 'comment':
				text = await r.getComment(args[1]).body;
				break;

			case 'set':
				if (args[1] === undefined || (args[1] !== 'default' && settingsTTS[args[1]] === undefined)) {
					message.reply('setting voice settings has an issue, use languageCode/ssmlGender/default');
				}
				else if (args[1] === 'default') {
					settingsTTS.languageCode = defaultTTS.languageCode;
					settingsTTS.ssmlGender = defaultTTS.ssmlGender;
				}
				else if (args[2] === undefined) {
					message.reply('value is unknown. supported voices: https://cloud.google.com/text-to-speech/docs/voices');
				}
				else {
					settingsTTS[args[1]] = args[2];
				}
				return;
			case 'url':
				text = await article(args[1], 'text');
				if (text.length === 0) {
					text = await urlExtraction(args[1]);
				}
				break;
			case 'stop':
				queued = [];
				if (client.voiceConnections.get(message.guild.id) !== undefined) {
					client.voiceConnections.get(message.guild.id).disconnect();
				}
				break;
			case 'skip':
				if (client.voiceConnections.get(message.guild.id) !== undefined) {
					client.voiceConnections.get(message.guild.id).disconnect();
					if (queued.length !== 0) {
						const next = queued.pop();
						this.playText(next.text, next.vc);
					}
				}
				break;
			case 'text':
			default:
				text = args.slice(1).join(' ');
				break;
		}

		if (await database.getConfigValue('CensorMode')) {
			text = await censorText(text, true);
		}

		// complying with maximum value of google text-to-speech and breaking up the text
		const words = breakSentence(text, 2950);
		if (client.voiceConnections.get(message.guild.id) === undefined) {
			this.playText(words[0], vc);
			words.slice(1).forEach((value) => queued.push({value, vc}));
		}
		else {
			words.forEach((value) => queued.push({value, vc}));
		}
	},

	async playText(text, vc) {
		// Creates a client
		const ttsClient = new textToSpeech.TextToSpeechClient();

		// Construct the request
		const request = {
			input: {ssml: ssmlValidate(text)},
			// Select the language and SSML Voice Gender (optional)
			voice: {languageCode: settingsTTS.languageCode, ssmlGender: settingsTTS.ssmlGender},
			// Select the type of audio encoding
			audioConfig: {audioEncoding: 'OGG_OPUS'},
		};

		// Performs the Text-to-Speech request
		const [response] = await ttsClient.synthesizeSpeech(request);

		const strm = streamifier.createReadStream(response.audioContent);
		const audio = strm.pipe(new prism.opus.OggDemuxer());

		const channel = client.channels.find((c) => c.id === vc);
		try {
			const connection = await channel.join();
			connection.playOpusStream(audio).on('end', () => {
				if (queued.length === 0) {
					channel.leave();
				}
				else {
					const next = queued.pop();
					this.playText(next.value, next.vc);
				}
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};
