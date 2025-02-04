const Discord = require("discord.js")
const { Aki } = require("aki-api");
const fs = require("fs");
const translate = require("./translate");
const awaitInput = require("./input");

const buttonMap = {
    "✅": "y",  // yes
    "❌": "n",  // no
    "❓": "i",  // don't know
    "👍": "p",  // probably
    "👎": "pn", // probably not
    "⏪": "b",  // back
    "🛑": "s"   // stop game
};

//helper function to get the user's reply from a button interaction
function getButtonReply(interaction) {
  const customId = interaction.customId;
  return buttonMap[customId] || null;
}

/**
 * Akinator Game Options
 * @typedef {object} gameOptions
 * @prop {string} [options.language="en"] The language of the game. Defaults to `en`.
 * @prop {boolean} [options.childMode=false] Whether to use Akinator's Child Mode. Defaults to `false`.
 * @prop {boolean} [options.useButtons=true] Whether to use Discord's buttons instead of message input for answering questions. Defaults to `true`.
 * @prop {Discord.ColorResolvable} [options.embedColor="Random"] The color of the message embeds. Defaults to `Random`.
 * @prop {object} [translationCaching={}] The options for translation caching.
 * @prop {boolean} [translationCaching.enabled=true] Whether to cache successful translations in a JSON file to reduce API calls and boost performance. Defaults to `true`.
 * @prop {string} [translationCaching.path="./translationCache"] The path to the directory where the translation cache files are stored. Defaults to `./translationCache`.
 * 
 * __Note:__ Paths are relative to the current working directory. (`process.cwd()`)
 */

/**
    * Start a game of Akinator.
    * 
    * Simply pass in the Discord `Message` or `CommandInteraction` sent by the user to this function to start the game.
    * 
    * Definitions and explanations of game options can be found [here](https://github.com/WillTDA/Discord.js-akinator#code-examples).
    * 
    * @param {Discord.Message | Discord.CommandInteraction} input The Message or Slash Command sent by the user.
    * @param {gameOptions} options The options for the game.
    * @returns {Promise<void>} Discord.js Akinator Game
    */

module.exports = async function (input, options) {
    //check discord.js version
    if (Discord.version.split(".")[0] < 14) return console.log(`Discord.js Akinator Error: Discord.js v14 or later is required.\nPlease check the README for finding a compatible version for Discord.js v${Discord.version.split(".")[0]}\nNeed help? Join our Discord server at 'https://discord.gg/P2g24jp'`);

    let inputData = {};
    try {
        //TODO: Data type validation
        //configuring game options if not specified
        options.language = options.language || "en";
        options.childMode = options.childMode !== undefined ? options.childMode : false;
        options.useButtons = options.useButtons !== undefined ? options.useButtons : true;
        options.embedColor = Discord.resolveColor(options.embedColor || "Random");

        //configuring translation caching options if not specified
        options.translationCaching = options.translationCaching || {};
        options.translationCaching.enabled = options.translationCaching.enabled !== undefined ? options.translationCaching.enabled : true;
        options.translationCaching.path = options.translationCaching.path || "./translationCache";

        options.language = options.language.toLowerCase();

        //error handling
        if (!input) return console.log("Discord.js Akinator Error: Message or CommandInteraction was not provided.\nNeed help? Join our Discord server at 'https://discord.gg/P2g24jp'");
        if (!input.client) return console.log("Discord.js Akinator Error: Message or CommandInteration provided was invalid.\nNeed help? Join our Discord server at 'https://discord.gg/P2g24jp'");
        if (!input.guild) return console.log("Discord.js Akinator Error: Cannot be used in Direct Messages.\nNeed help? Join our Discord server at 'https://discord.gg/P2g24jp'");
        if (!fs.existsSync(`${__dirname}/translations/${options.language}.json`)) return console.log(`Discord.js Akinator Error: Language "${options.language}" cannot be found. Examples: "en", "fr", "es", etc.\nNeed help? Join our Discord server at 'https://discord.gg/P2g24jp'`);

        try {
            inputData.client = input.client,
                inputData.guild = input.guild,
                inputData.author = input.author ? input.author : input.user,
                inputData.channel = input.channel
        } catch {
            return console.log("Discord.js Akinator Error: Failed to parse input for use.\nJoin our Discord server for support at 'https://discord.gg/P2g24jp'");
        }

        //defining for easy use
        let usertag = inputData.author.tag;
        let avatar = inputData.author.displayAvatarURL({ dynamic: true });

        //get translation object for the language
        let translations = require(`${__dirname}/translations/${options.language}.json`);

        let startingEmbed = {
            title: `${translations.startingGame}`,
            description: `**${translations.startingGameDesc}**`,
            color: options.embedColor,
            author: { name: usertag, icon_url: avatar }
        }

        let startingMessage;

        if ((input.commandName !== undefined) && (!input.replied) && (!input.deferred)) { //check if it's a slash command and hasn't been replied or deferred
            await input.deferReply();
            startingMessage = await input.editReply({ embeds: [startingEmbed] })
        } else {
            if (input.commandName !== undefined) { //check if it's a slash command
                startingMessage = await input.editReply({ embeds: [startingEmbed] })
            }
            else { startingMessage = await input.channel.send({ embeds: [startingEmbed] }) } //else, the input is a message
        }

        //starts the game
        let aki = new Aki({ region: "en", childMode: options.childMode }); // set to en region, translation is handled later
        let akiData = await aki.start();

        let notFinished = true;
        let hasGuessed = false;

        let noResEmbed = {
            title: translations.gameEnded,
            description: `**${inputData.author.username}, ${translations.gameEndedDesc}**`,
            color: options.embedColor,
            author: { name: usertag, icon_url: avatar }
        }

        let akiEmbed = {
            title: `${translations.question} ${aki.currentStep + 1}`,
            description: `**${translations.progress}: 0%\n${await translate(akiData.question, options.language, options.translationCaching)}**`,
            color: options.embedColor,
            fields: [],
            author: { name: usertag, icon_url: avatar }
        }

        if (!options.useButtons) {
            akiEmbed.footer = { text: translations.stopTip }
            akiEmbed.fields.push({ name: translations.pleaseType, value: `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**` })
        }

        let akiMessage;

        if (input.commandName !== undefined) { //check if it's a slash command
            akiMessage = await input.editReply({ embeds: [akiEmbed] })
        } else { akiMessage = await startingMessage.edit({ embeds: [akiEmbed] }); } //else, the input is a message

        let updatedAkiEmbed = akiMessage.embeds[0];

        //repeat while the game is not finished
        while (notFinished) {
            if (!notFinished) return;

            if (aki.guess?.id_base_proposition) { //if the algorithm has guessed the answer
                let guessEmbed = {
                    title: `${await translate(`I'm ${Math.round(aki.progress)}% sure your character is...`, options.language, options.translationCaching)}`,
                    description: `**${aki.guess.name_proposition}**\n${await translate(aki.guess.description_proposition, options.language, options.translationCaching)}\n\n${translations.isThisYourCharacter} ${!options.useButtons ? `**(Type Y/${translations.yes} or N/${translations.no})**` : ""}`,
                    color: options.embedColor,
                    image: { url: aki.guess.photo },
                    author: { name: usertag, icon_url: avatar },
                    fields: [
                        //{ name: translations.ranking, value: `**#${aki.answers[0].ranking}**`, inline: true }, //NO LONGER SUPPORTED
                        { name: translations.noOfQuestions, value: `**${aki.currentStep}**`, inline: true }
                    ],
                }

                await akiMessage.edit({ embeds: [guessEmbed] });
                akiMessage.embeds[0] = guessEmbed;

                await awaitInput(options.useButtons, inputData, akiMessage, true, translations, options.language, options.translationCaching)
                    .then(async response => {
                        if (response === null) {
                            notFinished = false;
                            akiMessage.edit({ embeds: [noResEmbed], components: [] })
                            return;
                        }
                        if (options.useButtons !== false) await response.deferUpdate()
                        let reply = getButtonReply(response) || response
                        const guessAnswer = reply.toLowerCase();

                        //if they answered yes
                        if (guessAnswer == "y" || guessAnswer == translations.yes.toLowerCase()) {
                            let finishedGameCorrect = {
                                title: translations.wellPlayed,
                                description: `**${inputData.author.username}, ${translations.guessedRightOneMoreTime}**`,
                                color: options.embedColor,
                                author: { name: usertag, icon_url: avatar },
                                fields: [
                                    { name: "Character", value: `**${aki.guess.name_proposition}**`, inline: true },
                                    //{ name: translations.ranking, value: `**#${aki.answers[0].ranking}**`, inline: true }, //NO LONGER SUPPORTED
                                    { name: translations.noOfQuestions, value: `**${aki.currentStep}**`, inline: true }
                                ]
                            }

                            if (options.useButtons) await response.editReply({ embeds: [finishedGameCorrect], components: [] })
                            else await akiMessage.edit({ embeds: [finishedGameCorrect], components: [] })
                            notFinished = false;
                            return;

                            //otherwise
                        } else if (guessAnswer == "n" || guessAnswer == translations.no.toLowerCase()) {
                            if (aki.currentStep >= 78 || hasGuessed == true) {
                                let finishedGameDefeated = {
                                    title: translations.wellPlayed,
                                    description: `**${inputData.author.username}, ${translations.defeated}**`,
                                    color: options.embedColor,
                                    author: { name: usertag, icon_url: avatar }
                                }

                                if (options.useButtons) await response.editReply({ embeds: [finishedGameDefeated], components: [] })
                                else await akiMessage.edit({ embeds: [finishedGameDefeated], components: [] })
                                notFinished = false;
                            } else {
                                if (options.useButtons) await response.editReply({ embeds: [guessEmbed], components: [] })
                                else await akiMessage.edit({ embeds: [guessEmbed], components: [] })
                                hasGuessed = true; // set hasGuessed to true so that the game doesn't keep guessing after the second attempt
                                aki.progress = 50
                                aki.continue(); //continue the game after the guess
                            }
                        }
                    });
            } else if (!akiData.question) {
                let finishedGameDefeated = {
                    title: translations.wellPlayed,
                    description: `**${inputData.author.username}, ${translations.defeated}**`,
                    color: options.embedColor,
                    author: { name: usertag, icon_url: avatar }
                }

                if (options.useButtons) await response.editReply({ embeds: [finishedGameDefeated], components: [] })
                else await akiMessage.edit({ embeds: [finishedGameDefeated], components: [] })
                notFinished = false; //end the game if the algorithm can't guess and there are no questions found
            }

            if (!notFinished) return;

            if (updatedAkiEmbed !== akiMessage.embeds[0]) {
                updatedAkiEmbed = {
                    title: `${translations.question} ${aki.currentStep + 1}`,
                    description: `**${translations.progress}: ${Math.round(aki.progress)}%\n${await translate(aki.question, options.language, options.translationCaching)}**`,
                    color: options.embedColor,
                    fields: [],
                    author: { name: usertag, icon_url: avatar }
                }

                if (!options.useButtons) {
                    updatedAkiEmbed.footer = { text: translations.stopTip }
                    updatedAkiEmbed.fields.push({ name: translations.pleaseType, value: `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**` })
                }
                await akiMessage.edit({ embeds: [updatedAkiEmbed] })
                akiMessage.embeds[0] = updatedAkiEmbed
            }

            await awaitInput(options.useButtons, inputData, akiMessage, false, translations, options.language, options.translationCaching)
                .then(async response => {
                    if (response === null) {
                        notFinished = false;
                        return akiMessage.edit({ embeds: [noResEmbed], components: [] })
                    }
                    if (options.useButtons !== false) await response.deferUpdate()
                    let reply = getButtonReply(response) || response
                    const answer = reply.toLowerCase();

                    //assign points for the possible answers given
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

                    let thinkingEmbed = {
                        title: `${translations.question} ${aki.currentStep + 1}`,
                        description: `**${translations.progress}: ${Math.round(aki.progress)}%\n${await translate(akiData.question, options.language, options.translationCaching)}**`,
                        color: options.embedColor,
                        fields: [],
                        author: { name: usertag, icon_url: avatar },
                        footer: { text: translations.thinking }
                    }

                    if (!options.useButtons) thinkingEmbed.fields.push({ name: translations.pleaseType, value: `**Y** or **${translations.yes}**\n**N** or **${translations.no}**\n**I** or **IDK**\n**P** or **${translations.probably}**\n**PN** or **${translations.probablyNot}**\n**B** or **${translations.back}**` })

                    if (options.useButtons) await response.editReply({ embeds: [thinkingEmbed], components: [] })
                    else await akiMessage.edit({ embeds: [thinkingEmbed], components: [] })
                    akiMessage.embeds[0] = thinkingEmbed

                    if (answer == "b" || answer == translations.back.toLowerCase()) {
                        if (aki.currentStep >= 1) {
                            akiData = await aki.back();
                        }

                        //stop the game if the user selected to stop
                    } else if (answer == "s" || answer == translations.stop.toLowerCase()) {
                        let stopEmbed = {
                            title: translations.gameEnded,
                            description: `**${inputData.author.username}, ${translations.gameForceEnd}**`,
                            color: options.embedColor,
                            author: { name: usertag, icon_url: avatar }
                        }

                        await akiMessage.edit({ embeds: [stopEmbed], components: [] })
                        notFinished = false;
                    } else {
                        let step = await aki.step(answers[answer]);
                        if (!step.guess?.id_base_proposition) akiData = step;
                    }

                    if (!notFinished) return;
                });
        }
    } catch (e) {
        //log any errors that come up
        console.log("Discord.js Akinator Error:")
        console.log(e);
    }
};
