// ------------------------------
// Mini servidor web para Render
// ------------------------------
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Inactivos corriendo ✅');
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en puerto ${PORT}`);
});

// ------------------------------
// Bot de Discord
// ------------------------------
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder 
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LOGO_URL = process.env.LOGO_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// ------------------------------
// Función que crea el embed
// ------------------------------
function crearEmbedBienvenida(user, guild) {
  const timestamp = Math.floor(Date.now() / 1000);

  return new EmbedBuilder()
    .setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true, size: 64 })
    })
    .setTitle("Bienvenido a Inactivos")
    .setDescription(`Gracias por unirte, somos ahora ${guild.memberCount} miembros • <t:${timestamp}:f>`)
    .setColor(0x000000) // NEGRO
    .setImage(LOGO_URL);
}

// ------------------------------
// Comando de prueba
// ------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const canal = await message.guild.channels.fetch(CHANNEL_ID);
      if (!canal) return message.reply("No encontré el canal de bienvenida.");

      const embed = crearEmbedBienvenida(message.author, message.guild);
      await canal.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("Ocurrió un error al enviar la bienvenida.");
    }
  }
});

// ------------------------------
// Bienvenida automática
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const canal = await member.guild.channels.fetch(CHANNEL_ID);
    if (!canal) return;

    const embed = crearEmbedBienvenida(member.user, member.guild);
    await canal.send({ embeds: [embed] });

  } catch (err) {
    console.error(err);
  }
});

// ------------------------------
// Login del bot
// ------------------------------
client.login(TOKEN);
