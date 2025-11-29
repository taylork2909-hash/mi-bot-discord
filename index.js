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
const { DateTime } = require('luxon');

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

// Función para generar texto de hora relativa
function formatJoinTime(joinedAt) {
  const now = DateTime.now();
  const joined = DateTime.fromJSDate(joinedAt);
  const diffDays = now.diff(joined, 'days').days;

  if (diffDays < 1) return `hoy a las ${joined.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
  if (diffDays < 2) return `ayer a las ${joined.toLocaleString(DateTime.TIME_24_SIMPLE)}`;
  return `el ${joined.toLocaleString(DateTime.DATETIME_MED)}`;
}

// Función para enviar mensaje de bienvenida
async function sendWelcome(member) {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const timeText = formatJoinTime(member.joinedAt);

    await channel.send({
      embeds: [{
        author: {
          name: member.user.username,
          icon_url: member.user.displayAvatarURL({ dynamic: true }),
        },
        title: 'Bienvenido a Inactivos',
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${timeText}`
        }
      }]
    });
  } catch (err) {
    console.error(err);
  }
}

// Bienvenida automática
client.on('guildMemberAdd', sendWelcome);

// Comandos de texto
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

  // Comando de prueba de bienvenida (no duplicará mensajes)
  if (message.content.toLowerCase() === '!testbienvenida') {
    await sendWelcome(message.member);
  }
});

client.login(TOKEN);
