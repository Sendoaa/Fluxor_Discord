require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const search = require("youtube-search");

// 🔹 Configurar la API de Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// 🔹 Autenticación con Spotify
async function authenticateSpotify() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    console.log("✅ Spotify autenticado correctamente");
  } catch (error) {
    console.error("❌ Error autenticando con Spotify:", error);
  }
}

authenticateSpotify();

// Mantener el bot activo
const express = require("express"); // Importa Express
const app = express(); // Crea una instancia de Express

// Crea un endpoint que responda a las solicitudes HTTP para mantener el bot activo
app.get("/", (req, res) => {
  res.send("Fluxor activo"); // Responde con "Bot activo" cuando se hace una solicitud a la raíz
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
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Configuración de búsqueda en YouTube
const youtubeOpts = {
  maxResults: 1,
  key: process.env.YOUTUBE_API_KEY,
  type: "video",
};

// Función para reproducir música
async function playMusic(voiceChannel, query, message) {
  try {
    const result = await search(query, youtubeOpts);
    if (!result.results.length)
      return message.reply("❌ No encontré la canción en YouTube.");

    const songUrl = result.results[0].link;
    message.reply(
      `🎵 **Reproduciendo:** ${result.results[0].title} \n🔗 ${songUrl}`
    );

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const stream = ytdl(songUrl, { filter: "audioonly" });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);
  } catch (error) {
    console.error("❌ Error al reproducir música:", error);
    message.reply("❌ Hubo un error al intentar reproducir la canción.");
  }
}

client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Evita que el bot responda a sí mismo

  // Comando !ping
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }

  // Comando !song <Nombre canción (Muestra los datos)
  if (message.content === "!song") {
    message.reply("Tienes que especificar una canción.");
  }

  // Comando !play <Nombre canción> (Se une al canal de voz y reproduce en youtube)
  if (message.content.startsWith("!play ")) {
    const query = message.content.replace("!play ", "").trim();
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.reply(
        "❌ Debes estar en un canal de voz para usar este comando."
      );
    }

    try {
      await playMusic(voiceChannel, query, message);
    } catch (error) {
      console.error("❌ Error al reproducir música:", error);
      message.reply("❌ Hubo un error al intentar reproducir la canción.");
    }
  }

  // Comando !stop (Detiene la musica)
  if (message.content === '!stop') {
    const voiceChannel = message.member.voice.channel;
    const connection = getVoiceConnection(message.guild.id);

    if (!voiceChannel) {
      return message.reply("❌ Debes estar en un canal de voz para detener la música.");
    }

    if (connection) {
      connection.destroy();
      message.reply("🛑 Música detenida.");
    } else {
      message.reply("❌ No estoy en un canal de voz.");
    }
  }

  // 🔹 Comando !song <nombre de la canción>
  if (message.content.startsWith("!song ")) {
    const songName = message.content.replace("!song", "");

    try {
      const result = await spotifyApi.searchTracks(songName);
      const firstTrack = result.body.tracks.items[0];

      if (firstTrack) {
        message.reply(
          `🎵 **${firstTrack.name}** - ${firstTrack.artists[0].name}\n🔗 ${firstTrack.external_urls.spotify}`
        );
      } else {
        message.reply("❌ No encontré esa canción en Spotify.");
      }
    } catch (error) {
      console.error("❌ Error buscando canción:", error);
      message.reply("❌ Hubo un error al buscar la canción.");
    }
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
  if (message.content === "!flip") {
    const result = Math.random() < 0.5 ? "Cara" : "Cruz";
    message.reply(`El lanzamiento de la moneda dio: **${result}**.`);
  }

  // Comandos
  if (message.content === "!comandos") {
    const comandos = `
    **Lista de Comandos:**
    > **!ping** - Responde con "Pong! 🏓".
    > **!avatar** - Muestra el avatar del usuario mencionado o del autor del mensaje.
    > **!comandos** - Muestra esta lista de comandos.
    > **!serverinfo** - Muestra información sobre el servidor.
    > **!userinfo** - Muestra información sobre el usuario mencionado o el autor del mensaje.
    > **!meme** - Envía un meme aleatorio desde Reddit.
    > **!flip** - Tira una moneda y saca cara o cruz.
    > **!song <Nombre de la canción>** - Busca una canción en spotify y la reproduce en youtube en el canal actual
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
