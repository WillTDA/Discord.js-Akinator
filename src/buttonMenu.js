const Discord = require("discord.js");

const MAXIMUM_ROWS = 5;
const MAXIMUM_BUTTONS_PER_ROWS = 5;

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

    const actionRows = [];
    let currentRow = { type: 1, components: [] }; // Initialize currentRow here

    for (let i = 0; i < buttons.length; i++) {
        if (currentRow.components.length >= MAXIMUM_BUTTONS_PER_ROWS) { // Check if current row is full
            actionRows.push(currentRow); // Push the full row
            currentRow = { type: 1, components: [] }; // Create a new row
        }
        currentRow.components.push(buttons[i]); // Add button to current row
    }

    if (currentRow.components.length > 0) { // Push the last row if it's not empty
        actionRows.push(currentRow);
    }

    if (actionRows.length > MAXIMUM_ROWS) {
        console.warn(`Button Menu Warning: Created ${actionRows.length} action rows, exceeding Discord's limit of ${MAXIMUM_ROWS} rows per message. Some buttons might not be visible.`);
    }

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
