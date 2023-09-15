let command = {
    name: "invite",
    description: "Get the invite link",
    description_localizations: {
        "de": "Erhalte den Einladungslink",
        "en-GB": "Get the invite link",
        "en-US": "Get the invite link",
    }
}

let executeCommand = function executeCommand(interaction) {
    const { commandName, options } = interaction;

    interaction.reply({
        "content": `${process.env.PROTOCOL}://${process.env.DOMAIN}${process.env.INVITEPATH}`,
        "ephemeral": true,
    }).catch(console.error)
}

module.exports.command = command;
module.exports.executeCommand = executeCommand;