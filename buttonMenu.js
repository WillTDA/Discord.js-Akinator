const Discord = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord.js");

/**
 * @param {Discord.Client} client The Discord Client.
 * @param {Discord.Message} message The Message Sent by the User.
 * @param {Discord.Message} botMessage The Message for the Bot to Send, also the message which will contain the buttons (Max. 8). MUST BE AN EMBED!
 * @param {MessageButton[]} buttons An Array of Buttons.
 * @param {Number} time Time in Milliseconds the Menu should last for.
 */

module.exports = async function (client, message, botMessage, buttons, time) {
    //check all our params exist
    if (!client) return console.log("Button Menu Error: No Client Provided!")
    if (!message) return console.log("Button Menu Error: No Message Provided!")
    if (!botMessage) return console.log("Button Menu Error: No Bot Message Provided!")
    if (!buttons) return console.log("Button Menu Error: No Buttons Provided!")
    if (!time) return console.log("Button Menu Error: No Time Provided!")
    //sort buttons into rows of four, as to build our menu
    let buttonRow = new MessageActionRow()
    let buttonRow2 = new MessageActionRow()
    let buttonRows = []

    for (let i = 0; i < buttons.length; i++) {
        if (i < 3) {
            buttonRow.addComponents(buttons[i]);
        }
        else {
            buttonRow2.addComponents(buttons[i])
        }
    }

    buttonRows.push(buttonRow)
    if (buttons.length >= 5) buttonRows.push(buttonRow2)

    console.log(botMessage)

    botMessage = await botMessage.edit({ embeds: [botMessage.embeds[0]], components: buttonRows });
    // create our collector
    const filter = (interaction) => interaction.user.id === message.author.id;

    let selection;

    let buttonCollector = message.channel.createMessageComponentCollector(filter, {
        time: 60000,
        max: 1,
    })
    
    buttonCollector.on("collect", async (collected) => {
        selection = collected;
        buttonCollector.empty();
        buttonCollector.stop();
    })

    //log the selection
    console.log(`Selected Button: ${selection}`);
    return selection;
}