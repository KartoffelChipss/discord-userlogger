const { Client, Intents, User, GatewayIntentBits, Interaction, Constants, Collection, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, ActivityType, AutoModerationActionExecution } = require("discord.js");
const client = new Client({ partials: ["CHANNEL"], intents: 579 });
require("dotenv").config();
const path = require('node:path');
const fs = require("fs");
const mongoose = require("mongoose");
const chalk = require("chalk");
const Webserver = require("./webserver/webserver.js");

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

if (process.env.DEVMODE === "true") {
    console.log(chalk.default.red("Bot started in development mode!"))
}

mongoose.connect(process.env.MONGOURI, {
    keepAlive: true
}).then(() => console.log(chalk.default.greenBright("Connected to database")));

client.once("ready", async () => {
    if (!process.env.LOGCHANNEL) {
        console.log(chalk.default.red("Logchannel not specified!"));
        return client.destroy();
    }
    if (!process.env.GUILDID) {
        console.log(chalk.default.red("Guild id not provided!"));
        return client.destroy();
    }

    await client.guilds.fetch();

    let guild = client.guilds.cache.get(process.env.GUILDID);

    if (!guild) {
        console.log(chalk.default.yellow(`Invite the bot with the following link:\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOTID}&permissions=274878228480&scope=bot`));
        return client.destroy();
    }

    console.log(chalk.default.greenBright(`${chalk.default.yellow(client.user.tag)} is now online!`));

    /* --- Set the presence --- */
    client.user.setPresence({
        activities: [{ name: `you!`, type: ActivityType.Watching }],
        status: 'online',
    });

    /* --- Register commands --- */
    let commands;
    if (process.env.DEVMODE === "true") {
        const guildId = "774263159674503188";
        const guild = client.guilds.cache.get(guildId);
        commands = guild.commands;
    } else {
        commands = client.application.commands;
    }

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandFile = require(filePath);
        commands.create(commandFile.command)
    }

    /* --- Start the webserver --- */
    Webserver(client);
});

client.on("error", (err) => {
    console.log(err);
});
client.on("warn", console.warn);

client.login(process.env.TOKEN);