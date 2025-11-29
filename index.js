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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ------------------------------
// Evitar doble mensaje
// ------------------------------
const welcomedMembers = new Set();

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

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

      const joinTime = DateTime.fromJSDate(message.member.joinedAt)
                               .setZone('local')
                               .toFormat("dd/MM/yyyy 'a las' HH:mm");

      channel.send({
        embeds: [{
          title: message.author.username,
          description: `Bienvenido a Inactivos`,
          color: 0x000000,
          thumbnail: { url: message.author.displayAvatarURL({ dynamic: true, size: 64 }) },
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

// Bienvenida automática
client.on('guildMemberAdd', async member => {
  if (welcomedMembers.has(member.id)) return;
  welcomedMembers.add(member.id);

  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const joinTime = DateTime.fromJSDate(member.joinedAt)
                             .setZone('local')
                             .toFormat("dd/MM/yyyy 'a las' HH:mm");

    channel.send({
      embeds: [{
        title: member.user.username,
        description: `Bienvenido a Inactivos`,
        color: 0x000000,
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true, size: 64 }) },
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
