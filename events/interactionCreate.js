const path = require('node:path');
const fs = require("fs");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {

        if (interaction.isCommand()) {
            const { commandName, options } = interaction;
            const commandDir = path.resolve(`${process.cwd()}${path.sep}commands`);

            if (fs.existsSync(`${commandDir}${path.sep}${commandName}.js`)) {

                let commandFile = require(`${commandDir}${path.sep}${commandName}.js`);

                commandFile.executeCommand(interaction);

                return;
            }
        }

    }
}