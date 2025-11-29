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

// Función para generar hora relativa
function formatJoinTime(date) {
  const now = DateTime.now();
  const joinTime = DateTime.fromJSDate(date).setZone(now.zoneName);

  if (joinTime.hasSame(now, 'day')) {
    return `hoy a las ${joinTime.toFormat('hh:mm a')}`;
  } else if (joinTime.hasSame(now.minus({ days: 1 }), 'day')) {
    return `ayer a las ${joinTime.toFormat('hh:mm a')}`;
  } else {
    return joinTime.toFormat('dd/MM/yyyy • hh:mm a');
  }
}

// Bienvenida automática
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const timeText = formatJoinTime(member.joinedAt);

    await channel.send({
      content: `<@${member.id}>`,
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `Disfruta tu estadía en el servidor!`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${timeText}`
        }
      }],
      allowedMentions: { users: [member.id] }
    });
  } catch (err) {
    console.error(err);
  }
});

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

  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if (!channel) return message.channel.send('No encontré el canal de bienvenida.');

      const timeText = formatJoinTime(message.member.joinedAt);

      await channel.send({
        content: `<@${message.author.id}>`,
        embeds: [{
          title: `Bienvenido a Inactivos`,
          description: `Disfruta tu estadía en el servidor!`,
          color: 0x000000,
          image: { url: LOGO_URL },
          footer: {
            text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • ${timeText}`
          }
        }],
        allowedMentions: { users: [message.author.id] }
      });

    } catch (err) {
      console.error(err);
      message.channel.send('Ocurrió un error al enviar la bienvenida de prueba.');
    }
  }
});

// Login del bot
client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

client.login(TOKEN);
