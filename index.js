const Discord = require("discord.js");
const { Aki } = require("aki-api");
const translatte = require("translatte");
const games = new Set();
const attemptingGuess = new Set();

/**
    * @param {Discord.Message} message The Message Sent by the User.
    * @param {"af" | "sq" | "am" | "ar" | "hy" | "az" | "eu" | "be" | "bn" | "bs" | "bg" | "ca" | "ceb" | "ny" | "zh" | "zh-cn" | "zh-tw" | "co" | "hr" | "cs" | "da" | "nl" | "en" | "eo" | "et" | "tl" | "fi" | "fr" | "fy" | "gl" | "ka" | "de" | "el" | "gu" | "ht" | "ha" | "haw" | "he" | "iw" | "hi" | "hmn" | "hu" | "is" | "ig" | "id" | "ga" | "it" | "ja" | "jw" | "kn" | "kk" | "km" | "ko" | "ku" | "ky" | "lo" | "la" | "lv" | "lt" | "lb" | "mk" | "mg" | "ms" | "ml" | "mt" | "mi" | "mr" | "mn" | "my" | "ne" | "no" | "ps" | "fa" | "pl" | "pt" | "pa" | "ro" | "ru" | "sm" | "gd" | "sr" | "st" | "sn" | "sd" | "si" | "sk" | "sl" | "so" | "es" | "su" | "sw" | "sv" | "tg" | "ta" | "te" | "th" | "tr" | "uk" | "ur" | "uz" | "vi" | "cy" | "xh" | "yi" | "yo" | "zu"} language (OPTIONAL): The Region/Language Code you want to Use. Defaults to "en".
    * @param {Boolean} useButtons (OPTIONAL): Whether you want to use Buttons instead of Typing your Response to the Question. Defaults to "false".
    * @returns Discord.js Akinator Game
    * @async
    * @example
    *  const Discord = require("discord.js");
    *  const client = new Discord.Client();
    *  const akinator = require("discord.js-akinator");
    * 
    * const PREFIX = "!";
    * 
    * client.on("message", async message => {
    *     if(message.content.startsWith(`${PREFIX}akinator`)) {
    *         akinator(message, "en") //language will default to "en" if it's not specified!
    *     }
    * });
       */

module.exports = async function (message, language, useButtons) {
    try {
        // error handling
        if (!message) return console.log("Discord.js Akinator Error: Message was not Provided.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!message.id || !message.channel || !message.channel.id || !message.author) return console.log("Discord.js Akinator Error: Message Provided was Invalid.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!message.guild) return console.log("Discord.js Akinator Error: Cannot be used in Direct Messages.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!language) language = "en";
        if (!useButtons) useButtons = false;

        // defining for easy use
        let usertag = message.author.tag
        let avatar = message.author.displayAvatarURL()

        // check if a game is being hosted by the player
        if (games.has(message.author.id)) {
            let alreadyPlayingEmbed = new Discord.MessageEmbed()
                .setAuthor(usertag, avatar)
                .setTitle(`❌ You're Already Playing!`)
                .setDescription("**You're already Playing a Game of Akinator. Type `S` or `Stop` to Cancel your Game.**")
                .setColor("RED")

            return message.channel.send({ embed: alreadyPlayingEmbed })
        }

        // adding the player into the game
        games.add(message.author.id)

        let startingEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(`Starting Game...`)
            .setDescription("**The Game will Start in About 3 Seconds...**")
            .setColor("RANDOM")

        let startingMessage = await message.channel.send({ embed: startingEmbed })

        // starts the game
        let aki = new Aki(language)
        await aki.start();

        let notFinished = true;
        let stepsSinceLastGuess = 0;
        let hasGuessed = false;

        let noResEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(`Game Ended`)
            .setDescription(`**${message.author.username}, your Game has Ended due to 1 Minute of Inactivity.**`)
            .setColor("RANDOM")

        let akiEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(`Question ${aki.currentStep + 1}`)
            .setDescription(`**Progress: 0%\n${aki.question}**`)
            .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**I** or **IDK**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
            .setFooter(`You can also type "S" or "Stop" to End your Game`)
            .setColor("RANDOM")

        await startingMessage.delete();
        let akiMessage = await message.channel.send({ embed: akiEmbed });

        // if message was deleted, quit the player from the game
        message.client.on("messageDelete", async deletedMessage => {
            if (deletedMessage.id == akiMessage.id) {
                notFinished = false;
                games.delete(message.author.id)
                attemptingGuess.delete(message.guild.id)
                await aki.win()
                return;
            }
        })

        // repeat while the game is not finished
        while (notFinished) {
            if (!notFinished) return;

            stepsSinceLastGuess = stepsSinceLastGuess + 1

            if (((aki.progress >= 95 && (stepsSinceLastGuess >= 10 || hasGuessed == false)) || aki.currentStep >= 78) && (!attemptingGuess.has(message.guild.id))) {
                attemptingGuess.add(message.guild.id)
                await aki.win();

                stepsSinceLastGuess = 0;
                hasGuessed = true;

                let guessEmbed = new Discord.MessageEmbed()
                    .setAuthor(usertag, avatar)
                    .setTitle(`I'm ${Math.round(aki.progress)}% Sure your Character is...`)
                    .setDescription(`**${aki.answers[0].name}**\n${aki.answers[0].description}\n\nIs this your Character? **(Type Y/Yes or N/No)**`)
                    .addField("Ranking", `**#${aki.answers[0].ranking}**`, true)
                    .addField("No. of Questions", `**${aki.currentStep}**`, true)
                    .setImage(aki.answers[0].absolute_picture_path)
                    .setColor("RANDOM")
                await akiMessage.edit({ embed: guessEmbed });

                // valid answers if the akinator sends the last question
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

                        // if they answered yes
                        if (guessAnswer == "y" || guessAnswer == "yes") {
                            let finishedGameCorrect = new Discord.MessageEmbed()
                                .setAuthor(usertag, avatar)
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

                            // otherwise
                        } else if (guessAnswer == "n" || guessAnswer == "no") {
                            if (aki.currentStep >= 78) {
                                let finishedGameDefeated = new Discord.MessageEmbed()
                                    .setAuthor(usertag, avatar)
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
                .setAuthor(usertag, avatar)
                .setTitle(`Question ${aki.currentStep + 1}`)
                .setDescription(`**Progress: ${Math.round(aki.progress)}%\n${aki.question}**`)
                .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**I** or **IDK**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
                .setFooter(`You can also type "S" or "Stop" to End your Game`)
                .setColor("RANDOM")
            akiMessage.edit({ embed: updatedAkiEmbed })

            // all valid answers when answering a regular akinator question
            const filter = x => {
                return (x.author.id === message.author.id && ([
                    "y",
                    "yes",
                    "n",
                    "no",
                    "i",
                    "idk",
                    "i",
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

                    // assign points for the possible answers given
                    const answers = {
                        "y": 0,
                        "yes": 0,
                        "n": 1,
                        "no": 1,
                        "i": 2,
                        "idk": 2,
                        "dont know": 2,
                        "don't know": 2,
                        "i": 2,
                        "p": 3,
                        "probably": 3,
                        "pn": 4,
                        "probably not": 4,
                    }

                    let thinkingEmbed = new Discord.MessageEmbed()
                        .setAuthor(usertag, avatar)
                        .setTitle(`Question ${aki.currentStep + 1}`)
                        .setDescription(`**Progress: ${Math.round(aki.progress)}%\n${aki.question}**`)
                        .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**I** or **IDK**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
                        .setFooter(`Thinking...`)
                        .setColor("RANDOM")
                    await akiMessage.edit({ embed: thinkingEmbed })

                    await responses.first().delete();

                    if (answer == "b" || answer == "back") {
                        if (aki.currentStep >= 1) {
                            await aki.back();
                        }

                        // stop the game if the user selected to stop
                    } else if (answer == "s" || answer == "stop") {
                        games.delete(message.author.id)
                        let stopEmbed = new Discord.MessageEmbed()
                            .setAuthor(usertag, avatar)
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
        // log any errors that come
        attemptingGuess.delete(message.guild.id)
        games.delete(message.guild.id)
        if (e == "DiscordAPIError: Unknown Message") return;
        console.log(`Discord.js Akinator Error: ${e}`)
    }
}
