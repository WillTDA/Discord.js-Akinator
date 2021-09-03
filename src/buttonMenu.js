const Discord = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord.js");

/**
 * @param {Discord.Client} client The Discord Client.
 * @param {any} input The Message Sent by the User.
 * @param {Discord.Message} botMessage The Message for the Bot to Send, also the message which will contain the buttons (Max. 8). MUST BE AN EMBED!
 * @param {MessageButton[]} buttons An Array of Buttons.
 * @param {Number} time Time in Milliseconds the Menu should last for.
 */

module.exports = async function (client, input, botMessage, buttons, time) {
    //check all our params exist
    if (!client) return console.log("Button Menu Error: No Client Provided!")
    if (!input) return console.log("Button Menu Error: No Message Provided!")
    if (!botMessage) return console.log("Button Menu Error: No Bot Message Provided!")
    if (!buttons) return console.log("Button Menu Error: No Buttons Provided!")
    if (!time) return console.log("Button Menu Error: No Time Provided!")
    
    let buttonRow = new MessageActionRow()
    let buttonRow2 = new MessageActionRow()
    let buttonRow3 = new MessageActionRow()
    let buttonRows = []

    for (let i = 0; i < buttons.length; i++) {
        if (i < 3) {
            buttonRow.addComponents(buttons[i]);
        }
        else if (i < 5) {
            buttonRow2.addComponents(buttons[i])
        }
        else {
            buttonRow3.addComponents(buttons[i])
        }

    }

    buttonRows.push(buttonRow)
    if (buttons.length >= 5) buttonRows.push(buttonRow2)
    if (buttons.length >= 7) buttonRows.push(buttonRow3)

    botMessage = await botMessage.edit({ embeds: [botMessage.embeds[0]], components: buttonRows });
    // create our collector
    const filter = (i) => i.user == input.author.id;

    let selection;

    await botMessage.channel.awaitMessageComponent({
        filter: filter,
        time: 60000,
        componentType: "BUTTON"
    })
        .then(async (i) => {
            selection = i;
        }).catch(() => {
            // do nothing
        });

    return selection;
}