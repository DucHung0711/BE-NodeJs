'use strict'

const { Client, GatewayIntentBits } = require('discord.js')

const {
    TOKEN_DISCORD, CHANNELID_DISCORD
} = process.env

class LoggerService {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages, 
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ] 
        })

        this.channelId = CHANNELID_DISCORD

        this.client.on('ready', () => {
            console.log(`Discord Logger Bot logged in as ${this.client.user.tag}`)
        })

        this.client.login(TOKEN_DISCORD).catch(err => {
            console.error('Failed to login to Discord:', err)
        })
    }

    sendToFormatCode(logData) {
        const {code, message = 'this is some infomation about the code.', title = 'Code Example'} = logData

        if (1 === 1) { // product and dev

        }

        const codeMessage = {
            content: message,
            embeds: [
                {
                    color: parseInt('00ff00', 16),
                    title: title,
                    description: '```json\n' + JSON.stringify(code, null, 2) + '\n```',
                    timestamp: new Date().toISOString()
                }
            ]
        }

        this.sendLogMessage(codeMessage)
    }

    sendLogMessage(message) {
        const channel = this.client.channels.cache.get(this.channelId)
        if (!channel) {
            console.error('Discord channel not found:', this.channelId)
            return
        }

        channel.send(message).catch(err => {
            console.error('Failed to send log message to Discord:', err)
        })
    }
}

const loggerService = new LoggerService()
module.exports = loggerService