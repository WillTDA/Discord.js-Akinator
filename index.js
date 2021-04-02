const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { Aki } = require("aki-api");
const games = new Set();

module.exports = {

    /**
    * @param {Discord.Message} message The Message Sent by the User.
    * @returns Discord.js Akinator Game
    * @async
    * @example
    *  const akinator = require("discord.js-akinator");
    * 
    * const PREFIX = "!";
    * 
    * client.on("message", async message => {
    *     if(message.content.startsWith(`${PREFIX}akiantor`)) {
    *         akinator.play(message)
    *     }
    * });
       */

    async play(message) {
        if (!message) return console.log("Discord.js Akinator Error: Message was not Provided. Need Help? Join Our Discord Server at 'https://discord.gg/P2g24jp'");
        if (games.has(message.author.id)) {
            let alreadyPlayingEmbed = new Discord.MessageEmbed()
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                .setTitle(`❌ You're Already Playing!`)
                .setDescription("**You're already Playing a Game of Akinator. Type `S` or `Stop` to Cancel your Game.**")
                .setColor("RED")

            return message.channel.send({ embed: alreadyPlayingEmbed })
        }
        games.add(message.author.id)

        let aki = new Aki("en", true)
        await aki.start();

        let notFinished = true;

        let akiEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(`Question ${aki.currentStep + 1}`)
            .setDescription(`**Progress: 0%\n${aki.question}**`)
            .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
            .setColor("RANDOM")

        let akiMessage = await message.channel.send({ embed: akiEmbed })

        while (notFinished) {

            if (aki.progress >= 95 || aki.currentStep >= 78) {
                await aki.win()
                let guessEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                    .setTitle(`I'm ${Math.round(aki.progress)}% Sure your Character is...`)
                    .addField("Your Character", `**${aki.answers[0].name}**`)
                    .setColor("RANDOM")
                await akiMessage.edit({ embed: guessEmbed });
                return
            }

            if (aki.currentStep + 1 !== 1) {
                let updatedAkiEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                    .setTitle(`Question ${aki.currentStep + 1}`)
                    .setDescription(`**Progress: ${Math.round(aki.progress)}%\n${aki.question}**`)
                    .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**\n**B** or **Back**")
                    .setFooter(`You can also type "S" or "Stop" to End your Game`)
                    .setColor("RANDOM")
                akiMessage.edit({ embed: updatedAkiEmbed })
            }

            const filter = x => {
                return (x.author.id === message.author.id && ([
                    "y",
                    "yes",
                    "n",
                    "no",
                    "idk",
                    "dont know",
                    "don't know",
                    "p",
                    "probably",
                    "pn",
                    "probably not",
                    "b",
                    "back",
                    "s",
                    "stop"
                ].includes(x.content.toLowerCase())));
            }

            await message.channel.awaitMessages(filter, {
                max: 1, time: 128000
            })
                .then(async responses => {
                    if (!responses.size) {
                        let noResEmbed = new Discord.MessageEmbed()
                            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                            .setTitle(`Game Ended`)
                            .setDescription(`**${message.author.username}, your Game has Ended due to 1 Minute of Inactivity.**`)
                            .setColor("RANDOM")
                        return message.channel.send({ embed: noResEmbed })
                    }
                    const answer = String(responses.first()).replace("'", "");

                    const answers = {
                        "y": 0,
                        "yes": 0,
                        "n": 1,
                        "no": 1,
                        "idk": 2,
                        "dont know": 2,
                        "p": 3,
                        "probably": 3,
                        "pn": 4,
                        "probably not": 4,
                    }

                    if (answer == "b" || answer == "back") {
                        await aki.back();
                        await responses.first().delete();
                    } else if (answer == "s" || answer == "stop") {
                        games.delete(message.author.id)
                        let stopEmbed = new Discord.MessageEmbed()
                            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                            .setTitle(`Game Ended`)
                            .setDescription(`**${message.author.username}, your game was successfully ended!**`)
                            .setColor("RANDOM")
                        return message.channel.send({ embed: stopEmbed })
                    } else {
                        await aki.step(answers[answer]);
                        await responses.first().delete();
                    }
                });
        }
    }
}