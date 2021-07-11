⚠ This Package is Still in Development! (Find any bugs? Join Our Discord Server, link is at the bottom of this page!)

# Discord.js Akinator

Create an Akinator Command for Your Discord Bot within Seconds of Installation.

UPDATE 2.1.0 - Now includes support for 10 new languages for questions, including French, German, Russian, Turkish and more! Update and use the new `region` parameter to try it out!

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

client.on("message", async message => {
    if(message.content.startsWith(`${PREFIX}akinator`)) {
        akinator(message, client, "en"); //region will default to "en" if it's not specified!
    }
});

client.login("Discord Bot Token")
```

# Special Thanks

- [Ashish#0540](https://github.com/3061LRTAGSPKJMORMRT) (For error handling and writing much cleaner code. Thanks!)

# Need Help? Join Our Discord Server!

https://discord.gg/P2g24jp