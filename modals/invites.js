const { Schema, model } = require("mongoose");

const guildBotSchema = new Schema({
    invite: {
        type: String,
    },
    ua: {
        type: String,
    },
    browser: {
        type: Object,
    },
    engine: {
        type: Object,
    },
    os: {
        type: Object,
    },
    device: {
        type: Object,
    },
    cpu: {
        type: Object,
    },
    ip: {
        type: String,
    },
    geo: {
        type: Object,
    },
    timestamp: {
        type: Number
    }
},
{
    timestamps: true,
});

module.exports = model("invites", guildBotSchema);