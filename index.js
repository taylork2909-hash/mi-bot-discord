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

const TOKEN = process.env.TOKEN;       // Token de Discord
const CHANNEL_ID = process.env.CHANNEL_ID; // ID del canal de bienvenida
const LOGO_URL = process.env.LOGO_URL; // URL de la imagen de bienvenida

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Función para formatear la fecha de manera relativa
function formatJoinTime(joinedAt) {
  const now = DateTime.now();
  const join = DateTime.fromJSDate(joinedAt);
  
  const diff = now.startOf('day').diff(join.startOf('day'), 'days').toObject().days;

  let dayText = 'hoy';
  if (diff >= 1 && diff < 2) dayText = 'ayer';
  else if (diff >= 2) dayText = join.toFormat('dd/MM/yyyy');

  return `${dayText} a las ${join.toFormat('HH:mm')}`;
}

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Comandos de texto
client.on('messageCreate', async message => {
  if(message.author.bot) return;

  // Comando !hola
  if(message.content.toLowerCase() === '!hola') {
    message.channel.send('¡Hola! El bot funciona correctamente ✅');
  }

  // Comando !reglas
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

  // Comando !testbienvenida
  if(message.content.toLowerCase() === '!testbienvenida') {
    try {
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if(!channel) return message.channel.send('No encontré el canal de bienvenida.');

      const joinTime = formatJoinTime(message.member.joinedAt);

      channel.send({
        embeds: [{
          title: `Bienvenido a Inactivos`,
          description: `<@${message.author.id}>`,
          color: 0x000000,
          image: { url: LOGO_URL },
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

    const joinTime = formatJoinTime(member.joinedAt);

    channel.send({
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${joinTime}`
        }
      }]
    });
  } catch(err) {
    console.error(err);
  }
});

// Login del bot
client.login(TOKEN);
