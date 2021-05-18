const Discord = require("discord.js");
const { Aki } = require("aki-api");
const games = new Set();
const attemptingGuess = new Set();

/**
    * @param {Discord.Message} message The Message Sent by the User.
    * @param {Discord.Client} client The Discord Client.
    * @returns Discord.js Akinator Game
    * @async
    * @example
    *  const akinator = require("discord.js-akinator");
    * 
    * const PREFIX = "!";
    * 
    * client.on("message", async message => {
    *     if(message.content.startsWith(`${PREFIX}akinator`)) {
    *         akinator(message)
    *     }
    * });
       */

module.exports = async function (message, client) {
    try {
        if (!message) return console.log("Discord.js Akinator Error: Message was not Provided.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!client) return console.log("Discord.js Akinator Error: Discord Client was not Provided, and is needed in the new 2.0.0 Update you installed.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");

        if (games.has(message.author.id)) {
            let alreadyPlayingEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                .setTitle(`❌ You're Already Playing!`)
                .setDescription("**You're already Playing a Game of Akinator. Type `S` or `Stop` to Cancel your Game.**")
                .setColor("RED")

            return message.channel.send({ embed: alreadyPlayingEmbed })
        }
        games.add(message.author.id)

        let startingEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(`Starting Game...`)
            .setDescription("**The Game will Start in About 3 Seconds...**")
            .setColor("RANDOM")

        let startingMessage = await message.channel.send({ embed: startingEmbed })

        let aki = new Aki("en")
        await aki.start();

        let notFinished = true;
        let stepsSinceLastGuess = 0;

        let noResEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(`Game Ended`)
            .setDescription(`**${message.author.username}, your Game has Ended due to 1 Minute of Inactivity.**`)
            .setColor("RANDOM")

        let akiEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(`Question ${aki.currentStep + 1}`)
            .setDescription(`**Progress: 0%\n${aki.question}**`)
            .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
            .setFooter(`You can also type "S" or "Stop" to End your Game`)
            .setColor("RANDOM")

        await startingMessage.delete();
        let akiMessage = await message.channel.send({ embed: akiEmbed });

        client.on("messageDelete", async deletedMessage => {
            if (deletedMessage.id == akiMessage.id) {
                notFinished = false;
                games.delete(message.author.id)
                attemptingGuess.delete(message.guild.id)
                await aki.win()
                return;
            }
        })

        while (notFinished) {
            if (!notFinished) return;

            stepsSinceLastGuess = stepsSinceLastGuess + 1

            if (((aki.progress >= 95 && stepsSinceLastGuess >= 10) || aki.currentStep >= 78) && (!attemptingGuess.has(message.guild.id))) {
                attemptingGuess.add(message.guild.id)
                await aki.win();

                stepsSinceLastGuess = 0;

                let guessEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                    .setTitle(`I'm ${Math.round(aki.progress)}% Sure your Character is...`)
                    .setDescription(`**${aki.answers[0].name}**\n${aki.answers[0].description}\n\nIs this your Character? **(Type Y/Yes or N/No)**`)
                    .addField("Ranking", `**#${aki.answers[0].ranking}**`, true)
                    .addField("No. of Questions", `**${aki.currentStep}**`, true)
                    .setImage(aki.answers[0].absolute_picture_path)
                    .setColor("RANDOM")
                await akiMessage.edit({ embed: guessEmbed });

                const guessFilter = x => {
                    return (x.author.id === message.author.id && ([
                        "y",
                        "yes",
                        "n",
                        "no"
                    ].includes(x.content.toLowerCase())));
                }

                await message.channel.awaitMessages(guessFilter, {
                    max: 1, time: 60000
                })
                    .then(async responses => {
                        if (!responses.size) {
                            return akiMessage.edit({ embed: noResEmbed });
                        }
                        const guessAnswer = String(responses.first()).toLowerCase();

                        await responses.first().delete();

                        attemptingGuess.delete(message.guild.id)

                        if (guessAnswer == "y" || guessAnswer == "yes") {
                            let finishedGameCorrect = new Discord.MessageEmbed()
                                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                                .setTitle(`Well Played!`)
                                .setDescription(`**${message.author.username}, I guessed right one more time!**`)
                                .addField("Character", `**${aki.answers[0].name}**`, true)
                                .addField("Ranking", `**#${aki.answers[0].ranking}**`, true)
                                .addField("No. of Questions", `**${aki.currentStep}**`, true)
                                .setColor("RANDOM")
                            await akiMessage.edit({ embed: finishedGameCorrect })
                            notFinished = false;
                            games.delete(message.author.id)
                            return;
                        } else if (guessAnswer == "n" || guessAnswer == "no") {
                            if (aki.currentStep >= 78) {
                                let finishedGameDefeated = new Discord.MessageEmbed()
                                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                                    .setTitle(`Well Played!`)
                                    .setDescription(`**${message.author.username}, bravo! You have defeated me...**`)
                                    .setColor("RANDOM")
                                await akiMessage.edit({ embed: finishedGameDefeated })
                                notFinished = false;
                                games.delete(message.author.id)
                            } else {
                                aki.progress = 50
                            }
                        }
                    });
            }

            if (!notFinished) return;

            let updatedAkiEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                .setTitle(`Question ${aki.currentStep + 1}`)
                .setDescription(`**Progress: ${Math.round(aki.progress)}%\n${aki.question}**`)
                .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
                .setFooter(`You can also type "S" or "Stop" to End your Game`)
                .setColor("RANDOM")
            akiMessage.edit({ embed: updatedAkiEmbed })

            const filter = x => {
                return (x.author.id === message.author.id && ([
                    "y",
                    "yes",
                    "n",
                    "no",
                    "idk",
                    "dont know",
                    "don't know",
                    "p",
                    "probably",
                    "pn",
                    "probably not",
                    "b",
                    "back",
                    "s",
                    "stop"
                ].includes(x.content.toLowerCase())));
            }

            await message.channel.awaitMessages(filter, {
                max: 1, time: 60000
            })
                .then(async responses => {
                    if (!responses.size) {
                        await aki.win()
                        notFinished = false;
                        games.delete(message.author.id)
                        return akiMessage.edit({ embed: noResEmbed })
                    }
                    const answer = String(responses.first()).toLowerCase().replace("'", "");

                    const answers = {
                        "y": 0,
                        "yes": 0,
                        "n": 1,
                        "no": 1,
                        "idk": 2,
                        "dont know": 2,
                        "p": 3,
                        "probably": 3,
                        "pn": 4,
                        "probably not": 4,
                    }

                    let thinkingEmbed = new Discord.MessageEmbed()
                        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                        .setTitle(`Question ${aki.currentStep + 1}`)
                        .setDescription(`**Progress: ${Math.round(aki.progress)}%\n${aki.question}**`)
                        .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
                        .setFooter(`Thinking...`)
                        .setColor("RANDOM")
                    await akiMessage.edit({ embed: thinkingEmbed })

                    await responses.first().delete();

                    if (answer == "b" || answer == "back") {
                        if (aki.currentStep >= 1) {
                            await aki.back();
                        }
                    } else if (answer == "s" || answer == "stop") {
                        games.delete(message.author.id)
                        let stopEmbed = new Discord.MessageEmbed()
                            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                            .setTitle(`Game Ended`)
                            .setDescription(`**${message.author.username}, your game was successfully ended!**`)
                            .setColor("RANDOM")
                        await aki.win()
                        await akiMessage.edit({ embed: stopEmbed })
                        notFinished = false;
                    } else {
                        await aki.step(answers[answer]);
                    }

                    if (!notFinished) return;
                });
        }
    } catch (e) {
        attemptingGuess.delete(message.guild.id)
        games.delete(message.guild.id)
        if (e == "DiscordAPIError: Unknown Message") return;
        console.log(`Discord.js Akinator Error: ${e}`)
    }
}