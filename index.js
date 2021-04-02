const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const prompter = require("discordjs-prompter");
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

        let aki = new Aki("en", true)
        await aki.start();

        let notFinished = true;

        let akiEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
            .setTitle(`Question ${aki.currentStep + 1}`)
            .setDescription(`**${aki.question}**`)
            .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**")
            .setColor("RANDOM")

        let akiMessage = await message.channel.send(akiEmbed)

        while (notFinished) {
            if (aki.currentStep + 1 >= 2) akiMessage.edit(
                new Discord.MessageEmbed()
                    .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                    .setTitle(`Question ${aki.currentStep + 1}`)
                    .setDescription(`**${aki.question}**`)
                    .addField("Please Type...", "**Y** or **Yes**\n**N** or **No**\n**IDK** or **Don't Know**\n**P** or **Probably**\n**PN** or **Probably Not**")
                    .setColor("RANDOM")
            )

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
                    "probably not"
                ].includes(x.content.toLowerCase())));
            }

            await message.channel.awaitMessages(filter, {
                max: 1, time: 128000
            })
                .then(async responses => {
                    if (!responses.size) {
                        return message.channel.send(
                            new Discord.MessageEmbed()
                                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                                .setTitle(`Game Ended`)
                                .setDescription(`**${message.author.username}, your Game has Ended due to 1 Minute of Inactivity.**`)
                                .setColor("RANDOM")
                        )
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

                    await aki.step(answers[answer]);
                    await responses.first().delete();

                    if (aki.progress >= 95 || aki.currentStep >= 78) {
                        await aki.win();
                        await akiMessage.edit(
                            new Discord.MessageEmbed()
                                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.displayAvatarURL())
                                .setTitle(`I'm ${Math.round(aki.progress)}% Sure your Character is...`)
                                .addField("Your Character", `**${aki.answers[0].name}**`)
                                .setColor("RANDOM")
                        )
                    }
                });
        }
    }
}