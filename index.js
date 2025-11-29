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

// Crear cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Ready
client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// ------------------------------
// Funcion crear embed
// ------------------------------
function crearEmbedBienvenida(user, guild) {

  const fecha = new Date();
  const fechaTexto = fecha.toLocaleDateString("es-CO"); // ejemplo: 29/11/2025

  return new EmbedBuilder()
    .setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true, size: 64 })
    })
    .setTitle("Bienvenido a Inactivos")
    .setColor(0x000000)
    .setImage(LOGO_URL)
    .setFooter({
      text: `Gracias por unirte, somos ahora ${guild.memberCount} miembros • ${fechaTexto}`
    });
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
