require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

//Mantener el bot activo
const express = require('express');  // Importa Express
const app = express();              // Crea una instancia de Express

// Crea un endpoint que responda a las solicitudes HTTP para mantener el bot activo
app.get('/', (req, res) => {
    res.send('Bot activo');  // Responde con "Bot activo" cuando se hace una solicitud a la raíz
});

// Escucha en un puerto (Render te asignará un puerto a través de `process.env.PORT`)
const port = process.env.PORT || 3000;  // Si no está definido, usa el puerto 3000 por defecto
app.listen(port, () => {
    console.log(`Servidor web escuchando en el puerto ${port}`);
});
//Mantener el bot activo

//Bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;  // Evita que el bot responda a sí mismo
    
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }

    if (message.content === '!comandos') {
        message.reply('Bot en construcción, proximamente habrá una lista con todos los comandos');
    }
});

// Inicia sesión con el token del bot
client.login(process.env.BOT_TOKEN);
