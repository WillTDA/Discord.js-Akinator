const Discord = require("discord.js");

/**
 * Creates an interactive button menu on a Discord message.
 *
 * @param {Discord.Client} client The Discord Client.
 * @param {Discord.Message} inputMessage The message that triggered the command.
 * @param {Discord.Message} botMessage The message the bot will send and attach buttons to. MUST BE AN EMBED!
 * @param {Discord.ButtonBuilder[]} buttons An array of Button Components.
 * @param {number} time Time in milliseconds the menu should last.
 * @returns {Promise<Discord.MessageComponentInteraction | null>} A Promise that resolves with the button interaction or null on timeout/error.
 */
module.exports = async function createButtonMenu(client, inputMessage, botMessage, buttons, time) {
    if (!client) {
        console.error("Button Menu Error: Discord Client is required.");
        return null;
    }
    if (!inputMessage) {
        console.error("Button Menu Error: Input Message (user's message) is required for context.");
        return null;
    }
    if (!botMessage || !botMessage.embeds || botMessage.embeds.length === 0) {
        console.error("Button Menu Error: Bot Message with at least one embed is required.");
        return null;
    }
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
        console.error("Button Menu Error: Buttons array is required and must not be empty.");
        return null;
    }
    if (typeof time !== 'number' || time <= 0) {
        console.error("Button Menu Error: Time (in milliseconds) must be a positive number.");
        return null;
    }

    const actionRows = buttons.reduce((rows, button, index) => {
        const rowIndex = Math.floor(index / 3);
        rows[rowIndex] = rows[rowIndex] || { type: 1, components: [] };
        rows[rowIndex].components.push(button);
        return rows;
    }, []).slice(0, 3); // Maximum 3 rows allowed by Discord

    try {
        const updatedMessage = await botMessage.edit({
            embeds: [botMessage.embeds[0]],
            components: actionRows
        });

        const filter = (interaction) => {
            if (interaction.user.id === inputMessage.author.id) {
                return true; // Only the command user can interact
            } else {
                interaction.deferUpdate(); // Acknowledge interaction for other users
                return false;
            }
        };

        const selection = await updatedMessage.awaitMessageComponent({
            filter: (i) => {
                const isAuthor = i.user.id === inputMessage.author.id;
                if (!isAuthor) i.deferUpdate();
                return isAuthor;
            },
            time
        });

        return selection;

    } catch (error) {
        console.error("Button Menu Error:", error);
        return null;
    }
};
