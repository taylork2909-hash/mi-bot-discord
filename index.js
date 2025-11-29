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

client.once('clientReady', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// ------------------------------
// Función para generar hora legible para todos
// ------------------------------
function formatJoinTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const horas = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  if (diffDays === 0) return `hoy a las ${horas}`;
  if (diffDays === 1) return `ayer a las ${horas}`;

  const fecha = date.toLocaleDateString("es-ES");
  return `${fecha} a las ${horas}`;
}

// ------------------------------
// Comandos
// ------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!hola') {
    message.channel.send('¡Hola! El bot funciona correctamente ✅');
  }

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

  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      const timeString = formatJoinTime(message.member.joinedAt);

      channel.send({
        embeds: [{
          title: `Bienvenido a Inactivos`,
          description: `<@${message.author.id}>\n**${timeString}**`,
          color: 0x000000,
          image: { url: LOGO_URL },
          footer: { text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros` }
        }],
        allowed_mentions: { users: [message.author.id] }
      });

    } catch (err) {
      console.error(err);
    }
  }
});

// ------------------------------
// Bienvenida real
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const timeString = formatJoinTime(member.joinedAt);

    channel.send({
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>\n**${timeString}**`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: { text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros` }
      }],
      allowed_mentions: { users: [member.id] }
    });

  } catch (err) {
    console.error(err);
  }
});

client.login(TOKEN);
