require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require('axios');

// Mantener el bot activo
const express = require("express"); // Importa Express
const app = express(); // Crea una instancia de Express

// Crea un endpoint que responda a las solicitudes HTTP para mantener el bot activo
app.get("/", (req, res) => {
  res.send("Bot activo"); // Responde con "Bot activo" cuando se hace una solicitud a la raíz
});

// Escucha en un puerto (Render te asignará un puerto a través de `process.env.PORT`)
const port = process.env.PORT || 3000; // Si no está definido, usa el puerto 3000 por defecto
app.listen(port, () => {
  console.log(`Servidor web escuchando en el puerto ${port}`);
});
//Fin mantener el bot activo

//Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Evita que el bot responda a sí mismo

  // Comando !ping
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }

  // Comando !serverinfo
  if (message.content === "!serverinfo") {
    const { guild } = message;

    // Datos del servidor
    const serverName = guild.name;
    const memberCount = guild.memberCount;
    const owner = guild.ownerId;
    const creationDate = guild.createdAt.toDateString();
    const rolesCount = guild.roles.cache.size;
    const channelsCount = guild.channels.cache.size;
    const icon =
      guild.iconURL({ dynamic: true, size: 512 }) || "No tiene icono";

    // Respuesta del bot
    message.reply(`🏠 **Información del Servidor**  
    📌 Nombre: **${serverName}**  
    👑 Dueño: <@${owner}>  
    📅 Creado el: **${creationDate}**  
    👥 Miembros: **${memberCount}**  
    🔢 Roles: **${rolesCount}**  
    📢 Canales: **${channelsCount}**  
    🖼 Icono: ${icon}`);
  }

  // Meme aleatorio
  if (message.content === "!meme") {
    try {
      const response = await axios.get("https://meme-api.com/gimme");
      const meme = response.data;

      const embed = new EmbedBuilder()
        .setColor("#ff9900")
        .setTitle(meme.title)
        .setImage(meme.url)
        .setFooter({ text: `Meme de ${meme.subreddit}` })
        .setURL(meme.postLink);

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error obteniendo el meme:", error);
      message.reply("❌ No se pudo obtener un meme, intenta de nuevo.");
    }
  }

  //Cara o cruz
  if (message.content === '!flip') {
    const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
    message.reply(`El lanzamiento de la moneda dio: **${result}**.`);
}

  // Comandos
  if (message.content === "!comandos") {
    const comandos = `
    **Lista de Comandos:**
    - **!ping** - Responde con "Pong! 🏓".
    - **!avatar** - Muestra el avatar del usuario mencionado o del autor del mensaje.
    - **!comandos** - Muestra esta lista de comandos.
    - **!serverinfo** - Muestra información sobre el servidor.
    - **!userinfo** - Muestra información sobre el usuario mencionado o el autor del mensaje.
    - **!meme** - Envía un meme aleatorio desde Reddit.
    - **!flip** - Tira una moneda y saca cara o cruz
    `;
    
    message.reply(comandos);
  }
});

// Obtener avatar propio o de un usuario
client.on("messageCreate", (message) => {
  if (!message.content.startsWith("!avatar")) return;

  // Obtener el usuario mencionado, si no hay mención, usar el autor del mensaje
  const user = message.mentions.users.first() || message.author;

  // Enviar el avatar del usuario
  message.reply(user.displayAvatarURL({ dynamic: true, size: 512 }));
});

// Fin obtener avatar

// Comando !userinfo
client.on("messageCreate", (message) => {
  if (!message.content.startsWith("!userinfo")) return;

  // Obtener el usuario mencionado o el que envió el mensaje
  const user = message.mentions.users.first() || message.author;
  const member = message.guild.members.cache.get(user.id);

  // Datos del usuario
  const username = user.tag;
  const userId = user.id;
  const createdAt = user.createdAt.toDateString();
  const joinedAt = member.joinedAt.toDateString();
  const roles = member.roles.cache.map((role) => role.name).join(", ");
  const avatar = user.displayAvatarURL({ dynamic: true, size: 512 });

  // Respuesta del bot
  message.reply(`👤 **Información de Usuario**  
    🔹 Nombre: **${username}**  
    🆔 ID: **${userId}**  
    📅 Cuenta creada: **${createdAt}**  
    🏠 Se unió al servidor: **${joinedAt}**  
    🎭 Roles: **${roles}**  
    🖼 Avatar: ${avatar}`);
});
// Fin comando !userinfo

// Inicia sesión con el token del bot
client.login(process.env.BOT_TOKEN);
