require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Evita que el bot responda a sí mismo
    
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
});

client.login(process.env.BOT_TOKEN);
