# Discord Userlogger

For the bot to function properly, you need to create a .env file in this directory and paste the following .env example in there. Then exchange the preset values for your own.

## Example for your .env file

```Shell
# Webserver Configuration
DEVMODE="false" # Only enable if your are running the bot on localhost
PORT="8000" # The port that your webserver should run on (If your hosting service provides you a port, you should use that one)
PROTOCOL="http" # The protocol that the bot should use for the "/invite" command
DOMAIN="example.com" # Your domain. Used for the "/invite" command (without "https://" or "http://")
INVITEPATH="/" # Choose the path for the invite. E.g: "/" for "https://example.com/" or "/discord" for "https://example.com/discord"

# Discord Configuration
GUILDID="535978043654392186" # The guild, that the bot should monitor
LOGCHANNEL="596581212500789257" # The channel where the user joined should be logged
INVITECHANNEL="525142016501377408" # The channel for the discord invites

# Bot Configuration
# You need to create a Discord app in the Discord Developer Portal (https://discord.com/developers/applications) and enter all details below
BOTID="944409694000073652" # Found on the "General Information" Tab under "APPLICATION ID"
TOKEN="yourtoken" # Found on the "Bot" Tab under "TOKEN". You might need to reset the token, but be carefull to not show this token to anyone else!
ACTIVITYTYPE="Watching" # possible options: "Watching", "Listening", "Playing", "Streaming"
ACTIVITYMSG="you!"

# Database Configuration
MONGOURI="mongouri" # The connection URI for your MongoDB Databse. This should be something like "mongodb+srv://<username>:<password>@cluster0-saugt.mongodb.net/<databasename>?retryWrites=true&w=majority"
```
