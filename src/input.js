const buttonMenu = require("./buttonMenu");
const Discord = require("discord.js");
const translate = require("./translate");

/**
 * @param {boolean} useButtons If true, use buttons. If false, use text input
 * @param {Discord.Message} message The Message Sent by the User.
 * @param {Discord.Message} botMessage The Message for the Bot to Send, also the message which will contain the buttons (Max. 8). MUST BE AN EMBED!
 * 
 */

module.exports = async function input(useButtons, message, botMessage, isGuessFilter, translations, language) {
    //check if useButtons is true. If so, use buttons.  If not, use text input
    if (useButtons) {

        let yes = new Discord.MessageButton()
            .setLabel(translations.yes)
            .setStyle("SECONDARY")
            .setEmoji("✅")
            .setCustomId("✅")

        let no = new Discord.MessageButton()
            .setLabel(translations.no)
            .setStyle("SECONDARY")
            .setEmoji("❌")
            .setCustomId("❌")

        let idk = new Discord.MessageButton()
            .setLabel(translations.dontKnow)
            .setStyle("SECONDARY")
            .setEmoji("❓")
            .setCustomId("❓")

        let probably = new Discord.MessageButton()
            .setLabel(translations.probably)
            .setStyle("SECONDARY")
            .setEmoji("👍")
            .setCustomId("👍")

        let probablyNot = new Discord.MessageButton()
            .setLabel(translations.probablyNot)
            .setStyle("SECONDARY")
            .setEmoji("👎")
            .setCustomId("👎")

        let back = new Discord.MessageButton()
            .setLabel(translations.back)
            .setStyle("SECONDARY")
            .setEmoji("🔙")
            .setCustomId("🔙")

        let stop = new Discord.MessageButton()
            .setLabel(translations.stop)
            .setStyle("DANGER")
            .setEmoji("🛑")
            .setCustomId("🛑")

        let answerTypes = [];

        if (isGuessFilter) {
            answerTypes = [yes, no]
        }
        else {
            answerTypes = [yes, no, idk, probably, probablyNot, back, stop]
        }

        let choice = await buttonMenu(message.client, message, botMessage, answerTypes, 60000);
        if (!choice) return null;

        await botMessage.delete(); //for some reason the command progresses further when this line is not here.

        if (choice === "✅") {
            return "y"
        }
        else if (choice === "❌") {
            return "n"
        }
        else if (choice === "❓") {
            return "i"
        }
        else if (choice === "👍") {
            return "p"
        }
        else if (choice === "👎") {
            return "pn"
        }
        else if (choice === "⏪") {
            return "b"
        }
        else if (choice === "🛑") {
            return "s"
        }
    }
    else {
        let filter;
        if (isGuessFilter) {
            filter = x => {
                return (x.author.id === message.author.id && ([
                    "y",
                    translations.yes.toLowerCase(),
                    "n",
                    translations.no.toLowerCase(),
                ].includes(x.content.toLowerCase())));
            }
        } else {
            filter = x => {
                return (x.author.id === message.author.id && ([
                    "y",
                    translations.yes.toLowerCase(),
                    "n",
                    translations.no.toLowerCase(),
                    "i",
                    "idk",
                    translations.dontKnowNoComma.toLowerCase(),
                    translations.dontKnow.toLowerCase(),
                    "p",
                    translations.probably.toLowerCase(),
                    "pn",
                    translations.probablyNot.toLowerCase(),
                    "b",
                    translations.back.toLowerCase(),
                    "s",
                    translations.stop.toLowerCase(),
                ].includes(x.content.toLowerCase())));
            }
        }
        let response = await message.channel.awaitMessages({
            filter: filter,
            max: 1,
            time: 60000
        })

        if (!response.size) {
            return null
        }
        else {
            await response.first().delete();
            return await translate(String(response.first()).toLowerCase(), language)
        }

    }
}