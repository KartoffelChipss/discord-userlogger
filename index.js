const { Client, Intents, User, GatewayIntentBits, Interaction, Constants, Collection, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, ActivityType, AutoModerationActionExecution } = require("discord.js");
const client = new Client({ partials: ["CHANNEL"], intents: 579 });
require("dotenv").config();
const path = require('node:path');
const fs = require("fs");
const mongoose = require("mongoose");
const chalk = require("chalk");
const Webserver = require("./webserver/webserver.js");
const invites = require("./modals/invites.js");

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

client.invites = {};

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
        console.log(chalk.default.yellow(`Invite the bot with the following link:\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOTID}&permissions=274878179345&scope=bot`));
        return client.destroy();
    }

    await guild.channels.fetch();
    let invitechannel = guild.channels.cache.get(process.env.INVITECHANNEL)

    invitechannel.fetchInvites().then(guildInvites => {
        guildInvites.each(guildInvite => {
            client.invites[guildInvite.code] = guildInvite.uses
        });
        console.log(chalk.default.greenBright("Fetched all invites"));
    })

    console.log(chalk.default.greenBright(`${chalk.default.yellow(client.user.tag)} is now online!`));

    /* --- Set the presence --- */
    client.user.setPresence({
        activities: [{ name: process.env.ACTIVITYMSG || "you!", type: ActivityType[process.env.ACTIVITYTYPE || "Watching"] }],
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

client.on('inviteCreate', (invite) => { //if someone creates an invite while bot is running, update store
    client.invites[invite.code] = invite.uses
});

client.on("guildMemberAdd", async (member) => {
    await client.guilds.fetch();
    let guild = client.guilds.cache.get(process.env.GUILDID);
    if (!guild) {
        console.log(chalk.default.yellow(`Invite the bot with the following link:\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOTID}&permissions=274878179345&scope=bot`));
        return client.destroy();
    }

    await guild.channels.fetch();
    let logchannel = guild.channels.cache.get(process.env.LOGCHANNEL)
    let invitechannel = guild.channels.cache.get(process.env.INVITECHANNEL)

    invitechannel.fetchInvites().then(guildInvites => {
        guildInvites.each(async (invite) => {
            if (invite.uses != client.invites[invite.code]) {
                let invitedoc = await invites.findOne({ invite: invite.code });
                logchannel.send({
                    "content": "",
                    "tts": false,
                    "embeds": [
                        {
                            "id": 42030309,
                            "fields": [],
                            "title": `${member.user.globalName}`,
                            "color": 0x2B2D31,
                            "description": `**User**\n<@${member.user.id}>\n\n**Invite code**\n\`${invitedoc.invite || "Not found? He?"}\`\n\n**IP Adress**\n\`${invitedoc.ip || "Not found"}\`\n\n**Location**\n\`${invitedoc.geo?.country || "Country not found"}, ${invitedoc.geo?.city || "City not found"}\`\n\n**Operating System**\n\`${invitedoc.os?.name || "OS name not found"} ${invitedoc.os?.version || "OS version not found"}\`\n\n**Browser**\n\`${invitedoc.browser?.name || "Browser name not found"} ${invitedoc.browser?.version || "Browser version not found"}\`\n\n**Engine**\n\`${invitedoc.engine?.name || "Engine name not found"} ${invitedoc.engine?.version || "Engine version not found"}\`\n\n**CPU Architecture**\n\`${invitedoc.cpu?.architecture || "Not found"}\``,
                            "thumbnail": {
                                "url": `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=512`
                            },
                            "footer": {
                                "text": member.user.id,
                                "icon_url": `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=512`
                            },
                            "timestamp": new Date().toISOString(),
                        }
                    ]
                });
                client.invites[invite.code] = invite.uses;
                invitedoc.username = member.user.globalName;
                invitedoc.userid = member.user.id;
                //await invitedoc.deleteOne();
            }
        })
    })
});

client.on("error", (err) => {
    console.log(err);
});
client.on("warn", console.warn);

client.login(process.env.TOKEN);