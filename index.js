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
const { DateTime } = require('luxon'); // Para manejar la hora legible

const TOKEN = process.env.TOKEN;       // Tu token de Discord en Render
const CHANNEL_ID = process.env.CHANNEL_ID; // Canal de bienvenida
const LOGO_URL = process.env.LOGO_URL; // URL de la imagen de la crew

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

// Función para formatear la hora local legible
function formatoHora(memberDate) {
  const ahora = DateTime.now().setZone('local');
  const joinTime = DateTime.fromJSDate(memberDate).setZone('local');

  if (ahora.hasSame(joinTime, 'day')) {
    return `hoy a ${joinTime.toFormat('hh:mm a')}`;
  } else if (ahora.minus({ days: 1 }).hasSame(joinTime, 'day')) {
    return `ayer a ${joinTime.toFormat('hh:mm a')}`;
  } else {
    return joinTime.toFormat('dd/MM/yyyy \'a las\' hh:mm a');
  }
}

// Comandos de texto
client.on('messageCreate', async message => {
  if(message.author.bot) return;

  if(message.content.toLowerCase() === '!hola') {
    message.channel.send('¡Hola! El bot funciona correctamente ✅');
  }

  if(message.content.toLowerCase() === '!reglas') {
    message.channel.send(`
**Reglas del servidor**
1. Sé respetuoso
2. No hagas spam
3. No NSFW
4. Evita drama
5. Sigue las instrucciones del staff
    `);
  }

  if(message.content.toLowerCase() === '!testbienvenida') {
    try {
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if(!channel) return message.channel.send('No encontré el canal de bienvenida.');

      const joinTime = formatoHora(message.member.joinedAt);

      channel.send({
        embeds: [{
          title: `${message.author.username}`,
          description: `Bienvenido a Inactivos`,
          color: 0x000000,
          thumbnail: { url: message.author.displayAvatarURL({ dynamic: true }) }, // Foto de perfil usuario
          image: { url: LOGO_URL }, // Logo de la crew grande
          footer: {
            text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • ${joinTime}`
          }
        }]
      });
    } catch(err) {
      console.error(err);
      message.channel.send('Ocurrió un error al enviar la bienvenida.');
    }
  }
});

// Bienvenida automática al entrar un nuevo miembro
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const joinTime = formatoHora(member.joinedAt);

    channel.send({
      embeds: [{
        title: `${member.user.username}`, // Nombre del usuario
        description: `Bienvenido a Inactivos`,
        color: 0x000000,
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) }, // Foto de perfil usuario
        image: { url: LOGO_URL }, // Logo de la crew grande
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${joinTime}`
        }
      }]
    });
  } catch(err) {
    console.error(err);
  }
});

client.login(TOKEN);
