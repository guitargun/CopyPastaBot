﻿const { Client, RichEmbed } = require('discord.js');
const database = require('./database');
const snoowrap = require('snoowrap');
const listCommand = require('./listCommand').init(database, RichEmbed);
const randomCommand = require('./randomCommand');
const copyPasta = require('./copypastaCommand');
const fs = require('fs');

let config;
let r;
let input = process.openStdin();
let lastCheck = 0;

fs.stat('./config.json', function (err, stat) {
    if (err === null) {
        config = require('./config.json')[0];
        client.login(config.AuthTkn);
        r = new snoowrap({
            userAgent: config.User_Agent,
            clientId: config.Client_Id,
            clientSecret: config.Client_Secret,
            username: config.Username,
            password: config.Password
        });
        copyPasta.init(database, r);
        randomCommand.init(database, r);
    } else if (err.code === 'ENOENT') {
        console.log("Deploying config");
        database.defaultConfig(fs, function () {
            config = require('./config.json')[0];
            console.log("Stopping app to get appropriate info");
        });
    }

});


// Initialize Discord Bot
const client = new Client();

client.on('ready', function (evt) {
    console.log("Connected");

    setInterval(function () {
        checkHot();

    }, config.IntervalTimeInSeconds * 1000);

});

input.addListener("data", async function (d) {
    d = d.toString().trim().split(" ");

    switch (d[0]) {
        case 'hot':
            checkHot();
            break;
    }
});


//reacting on certain commands
client.on('message', async (message) => {
    if (message.isMentioned(client.user.id)) {

        let args = message.content.split(" ");
        let cmd = args[1];
        args = args.slice(2, args.length);

        switch (cmd) {
            case 'ping':
                message.reply('pong');
                break;
            case 'list':
                listCommand.CommandHandler(message);
                break;
            case 'copypasta':
                copyPasta.CommandHandler(message, args);
                break;
            case 'random':
            case 'wisdom':
                randomCommand.CommandHandler(message);
                break;
            case 'help':
            default:
                helpCommandHandler(message);
                break;
        }
    }
});



//simple help handler
function helpCommandHandler(message) {
    let embed = new RichEmbed();
    embed.setTitle("Commands:");
    embed.addField("list", "returns the list of indexed copypasta's.");
    embed.addField("copypasta", "providing a valid copypasta id it replies with that copypasta.");
    embed.addField("random/wisdom", "gives a random copypasta.");
    message.reply(embed);
}

function checkHot() {
    let posts = 0;
    //getting the posts on the subreddit
    r.getSubreddit('copypasta').getHot({ after: lastCheck }).then(async (listing) => {
        for (let sub in listing) {
            if (posts === config.PostLimit) {
                break;
            }

            sub = listing[sub];
            //filtering the different things
            if (sub !== null && sub.id !== undefined && sub.ups >= config.MinUpvotes) {
                let in_DB = await database.checkPost(sub.id);
                //check if this is a new post
                if (in_DB === undefined) {
                    database.addPost(sub.id, await sub.title);
                    posts++;
                    //posting in the appropriate channels
                    client.channels.forEach(c => {
                        if ((config.Debug && c.guild.id === config.DebugServer) || !config.Debug) {
                            if (c.name.includes('copypasta')) {
                                const words = breakSentence(sub.selftext, 2000);
                                for (let w in words) {
                                    w = words[w];
                                    if (w.length !== 0) {
                                        c.send(w);
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }
        //updating the lastcheck timestamp
        lastCheck = new Date(new Date().toUTCString()).getTime();
    });
}



