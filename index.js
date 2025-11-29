// ------------------------------
// Mini servidor web para Render + UptimeRobot
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
const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LOGO_URL = process.env.LOGO_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Convierte fecha → UNIX timestamp
function getUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

// ------------------------------
// Comandos de texto
// ------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Comando !hola
  if (message.content.toLowerCase() === '!hola') {
    message.channel.send('¡Hola! El bot funciona correctamente ✅');
  }

  // Comando !reglas
  if (message.content.toLowerCase() === '!reglas') {
    message.channel.send(`
**Reglas del servidor**
1. Sé respetuoso
2. No hagas spam
3. No NSFW
4. Evita drama
5. Sigue las instrucciones del staff
    `);
  }

  // Comando !testbienvenida
  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if (!channel) return message.channel.send('No encontré el canal de bienvenida.');

      const unixTime = getUnix(message.member.joinedAt);

      channel.send({
        content: `<@${message.author.id}>`,
        allowed_mentions: { users: [message.author.id] },
        embeds: [{
          title: `Bienvenido a Inactivos`,
          description: `<@${message.author.id}>`,
          color: 0x000000,
          image: { url: LOGO_URL },
          footer: {
            text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • <t:${unixTime}:t>`
          }
        }]
      });

    } catch (err) {
      console.error(err);
      message.channel.send('Ocurrió un error al enviar la bienvenida.');
    }
  }
});

// ------------------------------
// Bienvenida automática al entrar un nuevo miembro
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const unixTime = getUnix(member.joinedAt);

    channel.send({
      content: `<@${member.id}>`,
      allowed_mentions: { users: [member.id] },
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • <t:${unixTime}:t>`
        }
      }]
    });

  } catch (err) {
    console.error(err);
  }
});

// Login del bot
client.login(TOKEN);
