const path = require("path");
const chalk = require("chalk");
const express = require("express");
const UAParser = require("ua-parser-js");
const geoip = require('geoip-lite');

const app = express();

const invitesModal = require("../modals/invites.js");

function getUserData(req) {
    const userAgent = req.headers['user-agent'];
    let parser = new UAParser(userAgent);
    let userData = parser.getResult();

    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop()
    userData.ip = ip;

    let geo = geoip.lookup(ip);
    userData.geo = geo;

    let timestamp = new Date().getTime();
    userData.timestamp = timestamp;

    return userData;
}

module.exports = async (client) => {
    app.set('trust proxy', true)

    if (process.env.DEVMODE === "true") {
        app.set('subdomain offset', 1);
        console.log(`${chalk.default.red("Subdomain offset set to")} ${chalk.default.yellow("1")}`);
    }

    await client.guilds.fetch();
    let guild = client.guilds.cache.get(process.env.GUILDID);
    if (!guild) {
        console.log(chalk.default.yellow(`Invite the bot with the following link:\nhttps://discord.com/api/oauth2/authorize?client_id=${process.env.BOTID}&permissions=274878228480&scope=bot`));
        return;
    }

    await guild.channels.fetch();
    let logchannel = guild.channels.cache.get(process.env.LOGCHANNEL)
    let invitechannel = guild.channels.cache.get(process.env.INVITECHANNEL)

    if (!logchannel || !invitechannel) return;

    app.get(process.env.INVITEPATH, async (req, res) => {
        let userData = getUserData(req);

        let invite = await invitechannel.createInvite({
            maxAge: 60 * 60,
            maxUses: 2,
            unique: true,
        }, `Userlogger invite`).catch(console.error)

        let invitedoc = await invitesModal.create({ invite: invite.code, browser: userData.browser, cpu: userData.cpu, device: userData.device, engine: userData.engine, geo: userData.geo, ip: userData.ip, os: userData.os, ua: userData.ua, timestamp: userData.timestamp });
        
        res.redirect(`https://discord.gg/${invite.code}`);

        console.log(`Created new invite code: ${chalk.default.yellow(invite.code)} for the following IP: ${chalk.default.yellow(userData.ip)} (${chalk.default.yellow(userData.geo?.country || "Undefined Country")})`);
    });

    app.listen(process.env.PORT, null, null, () =>
        console.log(chalk.default.green(`Webserver running on port ${chalk.default.yellow(process.env.PORT)}.`)),
    );
}