<h1 align="center">
    🔮 Discord.js Akinator 🔮 | By: <a href="https://diamonddigital.dev/"><img align="center" style="width:25%;height:auto" src="https://diamonddigital.dev/img/png/ddd_logo_text_transparent.png" alt="Diamond Digital Development Logo"></a>
</h1>

<center style="margin-bottom:1rem;">A Discord.js v14 module that allows you to create an Akinator command for your discord bot in a matter of seconds.</center>

[![NPM](https://nodei.co/npm/discord.js-akinator.png)](https://npmjs.com/package/discord.js-akinator)

[![Downloads](https://img.shields.io/npm/dt/discord.js-akinator?logo=npm&style=flat-square)](https://npmjs.com/package/discord.js-akinator) [![Discord Server](https://img.shields.io/discord/667479986214666272?logo=discord&logoColor=white&style=flat-square)](https://diamonddigital.dev/discord)

<a href="https://www.buymeacoffee.com/willtda" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## Features

- 🌎 <b>100+ Languages Supported!</b> | Lightning fast translation has been made possible by Google Translate and hard-coded mappings!

- ▶️ <b>Buttons!</b> | Don't want to type out responses to questions? This package gives you the option to use discord's buttons to easily click your answer of choice!

- 🎮 <b>Multiple Game Types!</b> | This package will allow you to choose whether Akinator will guess an animal, character or object!

- 🙋 <b>Child Mode!</b> | Want to filter out NSFW questions? You can choose to enable Akinator's Child Mode to keep your games squeaky clean!

- ⚡️ <b>Quick & Easy Setup!</b> | This package was built with the intentions of working out-of-the-box. Only one parameter is required at least!

- 🤖 <b>Slash Command & Message Support!</b> | No matter how your bot receives its commands, you can simply pass in a `CommandInteraction` or `Message` and it will work!

## Installation & Compatibility List

To install this package, simply run the following command in your terminal:

`npm i discord.js-akinator --save`

**Please Note:** The latest release of this package is only compatible with Discord.js v14. If you are using Discord.js v13 or v12, please refer to the table below to find the version that suits your needs.

| Discord.js Version | Recommended Package Version |
|--------------------|-----------------------------|
| v14.x.x            | v4.x.x (`@latest`)          |
| v13.x.x            | v3.x.x (`@3.4.5`)           |
| v12.x.x            | v2.1.0 or earlier           |

## Code Examples

### Initial Setup:
```js
const { Client, IntentsBitField } = require("discord.js");
const akinator = require("discord.js-akinator");
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.login("Discord Bot Token");

client.on("ready", () => {
    console.log("Bot is Online");
});

// Example options for Discord.js Akinator:

const language = "en"; // The Language of the Game
const childMode = false; // Whether to use Akinator's Child Mode
const gameType = "character"; // The Type of Akinator Game to Play. ("animal", "character" or "object")
const useButtons = true; // Whether to use Discord's Buttons
const embedColor = "#1F1E33"; // The Color of the Message Embeds
```
With Discord.js Akinator, you can choose whether you want to use a message, or a slash command as the input. Here's a quick example on how to do both!

### Using Discord's Slash Commands as Input:

```js
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return; // If the interaction is not a slash command, do nothing
    if (interaction.commandName === "akinator") { // If the user sends "/akinator"...
        akinator(interaction, {
            language: language, // Defaults to "en"
            childMode: childMode, // Defaults to "false"
            gameType: gameType, // Defaults to "character"
            useButtons: useButtons, // Defaults to "false"
            embedColor: embedColor // Defaults to "Random"
        });
    };
});
```

### Using a Message as Input:

```js
// ATTENTION: Make sure to enable the "Message Content" intent for your bot in the Discord Developer Portal!

const PREFIX = "!"; // Your bot's command prefix

client.on("messageCreate", async message => {
    if (message.content.startsWith(`${PREFIX}akinator`)) { // When the user types "!akinator"...
        akinator(message, {
            language: language, // Defaults to "en"
            childMode: childMode, // Defaults to "false"
            gameType: gameType, // Defaults to "character"
            useButtons: useButtons, // Defaults to "false"
            embedColor: embedColor // Defaults to "Random"
        });
    };
});
```

## Contributors

- [3061LRTAGSPKJMORMRT (Ashish#0540)](https://github.com/3061LRTAGSPKJMORMRT) (Error handling and writing much cleaner code)

- [ChaosArising (Josh_#9733)](https://github.com/ChaosArising) (Providing compatibility for Discord.js v13 in v3.0.0)

- ...and [many other people](https://github.com/WillTDA/Discord.js-Akinator/graphs/contributors) helping to make language translation more accurate, and so much more!

## Contact Us

- 👋 Need Help? [Join Our Discord Server](https://diamonddigital.dev/discord)!

- 👾 Found a Bug, or Inaccurate Translations? [Open an Issue](https://github.com/WillTDA/Discord.js-Akinator/issues), or Fork and [Submit a Pull Request](https://github.com/WillTDA/Discord.js-Akinator/pulls) on our [GitHub Repository](https://github.com/WillTDA/Discord.js-Akinator)!
<hr>
<center>
<strong>Created and maintained by</strong>
<a href="https://diamonddigital.dev/"><img align="center" style="width:25%;height:auto" src="https://diamonddigital.dev/img/png/ddd_logo_text_transparent.png" alt="Diamond Digital Development Logo"></a>
</center>