⚠ This Package is Still in Development! (Find any bugs? Join Our Discord Server, link is at the bottom of this page!)

# Discord.js Akinator

Create an Akinator Command for Your Discord Bot within Seconds of Installation.

UPDATE 3.0.0 - Lots of new Changes! (and some breaking, so be careful!)

New Features Include:

## <u>FULL TRANSLATION (100+ New Languages!)</u>

Discord.js Akinator no longer relies on other Akinator API servers to translate, as they are all slow and laggy apart from the European one. Also, they only translate the questions and nothing else!

By utilising another package known as [Translatte](https://npmjs.com/package/translatte), translation of OVER 100 NEW LANGUAGES are now supported by using the Google API!

## <u>BUTTONS!</u>

By adding an extra `Boolean` parameter, you can choose to use the new discord buttons!

Do keep in mind that it is `false` by default.

## <u>NO CLIENT PARAMETER NEEDED!</u>

The package no longer requires you to pass in a `Discord.Client` object to function.

Just pass in the `Discord.Message` (and your language of choice) and it'll handle the rest!

# Install Package

Let's take a look at how you can install this package into your Discord Bot Project.

`npm i discord.js-akinator --save`

# Example Code

```js
const Discord = require("discord.js");
const akinator = require("discord.js-akinator");
const client = new Discord.Client();

const PREFIX = "!";

client.on("ready", () => {
    console.log("Bot is Online")
});

let language = "en";
let useButtons = true;

client.on("message", async message => {
    if(message.content.startsWith(`${PREFIX}akinator`)) {
        akinator(message, language, useButtons);
        // language will default to "en" if it's not specified!
        // useButtons will default to "false" if it's not specified!
    }
});

client.login("Discord Bot Token")
```

# Special Thanks

- [Ashish#0540](https://github.com/3061LRTAGSPKJMORMRT) (For error handling and writing much cleaner code. Thanks!)

# Need Help? Join Our Discord Server!

https://discord.gg/P2g24jp