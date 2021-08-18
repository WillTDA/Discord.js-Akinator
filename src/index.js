const Discord = require("discord.js");
const { Aki } = require("aki-api");
const fs = require("fs");
const translate = require("./translate");
const input = require("./input");
const games = new Set();
const attemptingGuess = new Set();

// this simply gets the user's reply from a button interaction (that is, if the user has chosen to enable buttons)
function getButtonReply(interaction) {
    interaction = interaction.customId;

    if (interaction === "✅") { //yes
        return "y"
    }
    else if (interaction === "❌") { //no
        return "n"
    }
    else if (interaction === "❓") { //don't know
        return "i"
    }
    else if (interaction === "👍") { //probably
        return "p"
    }
    else if (interaction === "👎") { //probably not
        return "pn"
    }
    else if (interaction === "⏪") { //back
        return "b"
    }
    else if (interaction === "🛑") { //stop game
        return "s"
    }
    else return null;
}

/**
    * Play a Game of Akinator.
    * 
    * Simply pass in the Discord Message Sent by the User to Setup the Game.
    * 
    * __Game Options__
    * 
    * - `language` - The Language of the Game.
    * - `childMode` - Whether to use Akinator's Child Mode.
    * - `useButtons` - Whether to use Discord's Buttons.
    * 
    * @param {Discord.Message} message The Message Sent by the User.
    * @param {object} options The Options for the Game.
    * @param {string} [options.language="en"] The Language of the Game. Defaults to "en".
    * @param {boolean} [options.childMode=false] Whether to use Akinator's Child Mode. Defaults to "false".
    * @param {boolean} [options.useButtons=false] Whether to use Discord's Buttons. Defaults to "false".
    * @returns {Promise<Discord.Message>} Discord.js Akinator Game
    * @example
    * const { Client, Intents } = require("discord.js");
    * const akinator = require("discord.js-akinator");
    * const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    *
    * client.on("ready", () => {
    *     console.log("Bot is Online")
    * });
    * 
    * const PREFIX = "!";
    * 
    * //Defining options
    * 
    * const language = "en"; //The Language of the Game
    * const childMode = false; //Whether to use Akinator's Child Mode
    * const useButtons = true; //Whether to use Discord's Buttons
    * 
    * client.on("messageCreate", async message => {
    *     if(message.content.startsWith(`${PREFIX}akinator`)) {
    *         akinator(message, {
    *             language: language, //Defaults to "en"
    *             childMode: childMode, //Defaults to "false"
    *             useButtons: useButtons //Defaults to "false"
    *         });
    *     }
    * });
*/

module.exports = async function (message, options = {}) {
    try {
        // configuring game options if not specified
        options.language = options.language || "en";
        options.childMode = options.childMode || false;
        options.useButtons = options.useButtons || false;

        // error handling
        if (!message) return console.log("Discord.js Akinator Error: Message was not Provided.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!message instanceof Discord.Message) return console.log("Discord.js Akinator Error: Message Provided was Invalid.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!message.guild) return console.log("Discord.js Akinator Error: Cannot be used in Direct Messages.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (!fs.existsSync(`${__dirname}/translations/${options.language}.json`)) return console.log(`Discord.js Akinator Error: options.language "${options.language}" Not Found. Example: "en" or "fr" or "es".\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'`);
        if (!options.useButtons) options.useButtons = false;

        // defining for easy use
        let usertag = message.author.tag
        let avatar = message.author.displayAvatarURL()

        // check if a game is being hosted by the player
        if (games.has(message.author.id)) {
            let alreadyPlayingEmbed = new Discord.MessageEmbed()
                .setAuthor(usertag, avatar)
                .setTitle(`❌ ${await translate("You're already playing!", options.language)}`)
                .setDescription(`**${await translate("You're already playing a game of Akinator. Type `S` or `Stop` to cancel your game.", options.language)}**`)
                .setColor("RED")

            return message.channel.send({ embeds: [alreadyPlayingEmbed] })
        }

        // adding the player into the game
        games.add(message.author.id)

        let startingEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(`${await translate("Starting Game...", options.language)}`)
            .setDescription(`**${await translate("The game will start in a few seconds...", options.language)}**`)
            .setColor("RANDOM")

        let startingMessage = await message.channel.send({ embeds: [startingEmbed] })

        // get translation object for the language
        let translations = require(`${__dirname}/translations/${options.language}.json`);

        // starts the game
        let aki = new Aki("en", options.childMode)
        await aki.start();

        let notFinished = true;
        let stepsSinceLastGuess = 0;
        let hasGuessed = false;

        let noResEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(translations.gameEnded)
            .setDescription(`**${message.author.username}, ${translations.gameEndedDesc}**`)
            .setColor("RANDOM")

        let akiEmbed = new Discord.MessageEmbed()
            .setAuthor(usertag, avatar)
            .setTitle(`${translations.question} ${aki.currentStep + 1}`)
            .setDescription(`**${translations.progress}: 0%\n${await translate(aki.question, options.language)}**`)
            .setFooter(translations.stopTip)
            .setColor("RANDOM")

        if (!options.useButtons) akiEmbed.addField(translations.pleaseType, `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**`)

        await startingMessage.delete();
        let akiMessage = await message.channel.send({ embeds: [akiEmbed] });

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
                    .setTitle(`${await translate(`I'm ${Math.round(aki.progress)}% sure your character is...`, options.language)}`)
                    .setDescription(`**${await translate(aki.answers[0].name, options.language)}**\n${await translate(aki.answers[0].description, options.language)}\n\n${translations.isThisYourCharacter} **(Type Y/${translations.yes} or N/${translations.no})**`)
                    .addField(translations.ranking, `**#${aki.answers[0].ranking}**`, true)
                    .addField(translations.noOfQuestions, `**${aki.currentStep}**`, true)
                    .setImage(aki.answers[0].absolute_picture_path)
                    .setColor("RANDOM")
                await akiMessage.edit({ embeds: [guessEmbed] });
                akiMessage.embeds[0] = guessEmbed;

                await input(options.useButtons, message, akiMessage, true, translations, options.language)
                    .then(async response => {
                        if (response === null) {
                            notFinished = false;
                            games.delete(message.author.id)
                            akiMessage.edit({ embeds: [noResEmbed], components: [] })
                            return;
                        }
                        let reply = getButtonReply(response) || response
                        const guessAnswer = reply.toLowerCase();

                        attemptingGuess.delete(message.guild.id)

                        // if they answered yes
                        if (guessAnswer == "y" || guessAnswer == translations.yes.toLowerCase()) {
                            let finishedGameCorrect = new Discord.MessageEmbed()
                                .setAuthor(usertag, avatar)
                                .setTitle(translations.wellPlayed)
                                .setDescription(`**${message.author.username}, ${translations.guessedRightOneMoreTime}**`)
                                .addField(translations.character, `**${await translate(aki.answers[0].name, options.language)}**`, true)
                                .addField(translations.ranking, `**#${aki.answers[0].ranking}**`, true)
                                .addField(translations.noOfQuestions, `**${aki.currentStep}**`, true)
                                .setColor("RANDOM")
                            if (options.useButtons) await response.update({ embeds: [finishedGameCorrect], components: [] })
                            else await akiMessage.edit({ embeds: [finishedGameCorrect], components: [] })
                            notFinished = false;
                            games.delete(message.author.id)
                            return;

                            // otherwise
                        } else if (guessAnswer == "n" || guessAnswer == translations.no.toLowerCase()) {
                            if (aki.currentStep >= 78) {
                                let finishedGameDefeated = new Discord.MessageEmbed()
                                    .setAuthor(usertag, avatar)
                                    .setTitle(`Well Played!`)
                                    .setDescription(`**${message.author.username}, ${translations.defeated}**`)
                                    .setColor("RANDOM")
                                await akiMessage.edit({ embeds: [finishedGameDefeated], components: [] })
                                notFinished = false;
                                games.delete(message.author.id)
                            } else {
                                aki.progress = 50
                            }
                        }
                    });
            }

            if (!notFinished) return;

            if (aki.currentStep !== 0) {
                let updatedAkiEmbed = new Discord.MessageEmbed()
                    .setAuthor(usertag, avatar)
                    .setTitle(`${translations.question} ${aki.currentStep + 1}`)
                    .setDescription(`**${translations.progress}: ${Math.round(aki.progress)}%\n${await translate(aki.question, options.language)}**`)
                    .setFooter(translations.stopTip)
                    .setColor("RANDOM")
                if (!options.useButtons) updatedAkiEmbed.addField(translations.pleaseType, `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**`)

                await akiMessage.edit({ embeds: [updatedAkiEmbed] })
                akiMessage.embeds[0] = updatedAkiEmbed
            }

            await input(options.useButtons, message, akiMessage, false, translations, options.language)
                .then(async response => {
                    if (response === null) {
                        await aki.win()
                        notFinished = false;
                        games.delete(message.author.id)
                        return akiMessage.edit({ embeds: [noResEmbed], components: [] })
                    }
                    let reply = getButtonReply(response) || response
                    const answer = reply.toLowerCase();

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
                        .setTitle(`${translations.question} ${aki.currentStep + 1}`)
                        .setDescription(`**${translations.progress}: ${Math.round(aki.progress)}%\n${await translate(aki.question, options.language)}**`)
                        .setFooter(translations.thinking)
                        .setColor("RANDOM")
                    if (!options.useButtons) thinkingEmbed.addField(translations.pleaseType, `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**`)

                    if (options.useButtons) await response.update({ embeds: [thinkingEmbed], components: [] })
                    else await akiMessage.edit({ embeds: [thinkingEmbed], components: [] })
                    akiMessage.embeds[0] = thinkingEmbed

                    if (answer == "b" || answer == translations.back.toLowerCase()) {
                        if (aki.currentStep >= 1) {
                            await aki.back();
                        }

                        // stop the game if the user selected to stop
                    } else if (answer == "s" || answer == translations.stop.toLowerCase()) {
                        games.delete(message.author.id)
                        let stopEmbed = new Discord.MessageEmbed()
                            .setAuthor(usertag, avatar)
                            .setTitle(translations.gameEnded)
                            .setDescription(`**${message.author.username}, ${translations.gameForceEnd}**`)
                            .setColor("RANDOM")
                        await aki.win()
                        await akiMessage.edit({ embeds: [stopEmbed], components: [] })
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
        else if (e == "DiscordAPIError: Cannot send an empty message") return console.log("Discord.js Akinator Error: Discord.js v13 or Higher is Required.\nNeed Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        console.log("Discord.js Akinator Error:")
        console.log(e);
    }
}
