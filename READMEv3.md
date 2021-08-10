# TO THOSE LOOKING AT THE SOURCE CODE

DO NOT FOLLOW ANY CODE SHOWN IN THIS README, AS IT'S GOING TO BE USED IN A FUTURE UPDATE.

EVERYTHING SAID IN THIS MARKDOWN IS INACCURATE AND WILL NOT WORK UNTIL v3.0.0 IS RELEASED.

# Discord.js Akinator

Create an Akinator Command for Your Discord Bot within Seconds of Installation.

UPDATE 3.0.0 - Lots of new Changes! (and some breaking, so be careful!)

New Features Include:

## <u>FULL TRANSLATION (100+ New Languages!)</u>

Discord.js Akinator no longer relies on other Akinator API servers to translate, as they are all slow and laggy apart from the European one. Also, they would only translate the questions and nothing else!

By utilising Google Translate and creating hard-coded translation mappings, OVER 100 NEW LANGUAGES are now supported! Also, every piece of text is now translatable, not just the questions!

## <u>BUTTONS!</u>

With this new option, you can choose to use the new discord buttons!

Do keep in mind that it is `false` by default.

## <uCHILD MODE!</u>

Want to filter out NSFW questions? Simply set this option to `true`!

Again, this will default to `false`.

## <u>NO CLIENT PARAMETER NEEDED!</u>

The package no longer requires you to pass in a `Discord.Client` object to function.

Just pass in the `Discord.Message` and it'll handle the rest!

# Install Package

Let's take a look at how you can install this package into your Discord Bot Project.

`npm i discord.js-akinator --save`

For versions 3.0.0 and Above, you'll also need discord.js v13. This can easily be installed with:

`npm i discord.js@13 --save`

For versions earlier than 3.0.0, you need discord.js v12. However it is recommended you update to patch bugs and security vulnerabilities.

`npm i discord.js@12 --save`

# Example Code

```js
const { Client, Intents } = require("discord.js");
const akinator = require("discord.js-akinator");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
    console.log("Bot is Online")
});

const PREFIX = "!";

//Defining akinator options

const language = "en"; //The language to use
const childMode = false; //Whether to use Akinator's Child Mode
const useButtons = true; //Whether to use Discord's Buttons

client.on("messageCreate", async message => {
    if(message.content.startsWith(`${PREFIX}akinator`)) {
        akinator(message, {
            language: language, //Defaults to "en"
            childMode: childMode //Defaults to "false"
            useButtons: useButtons, //Defaults to "false"
        });
    }
});

client.login("Discord Bot Token")
```

# Contributors

- [ChaosArising (Josh_#9733)](https://github.com/ChaosArising) (Providing compatibility for Discord.js v13)

- [3061LRTAGSPKJMORMRT (Ashish#0540)](https://github.com/3061LRTAGSPKJMORMRT) (Error handling and writing much cleaner code)

# Need Help or Find Any Bugs? Join Our Discord Server!

https://discord.gg/P2g24jp
