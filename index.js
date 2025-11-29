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

const TOKEN = process.env.TOKEN;       // Tu token de Discord en Render
const CHANNEL_ID = process.env.CHANNEL_ID; // Tu canal de bienvenida en Render
const LOGO_URL = process.env.LOGO_URL; // URL de la imagen de bienvenida

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ------------------------------
// Prevenir doble mensaje
// ------------------------------
const welcomedMembers = new Set();

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

      const joinTime = message.member.joinedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

      channel.send({
        embeds: [{
          title: message.author.username, // Nombre del usuario
          description: `Bienvenido a Inactivos`,
          color: 0x000000,
          thumbnail: { url: message.author.displayAvatarURL({ dynamic: true, size: 64 }) }, // Foto de perfil pequeña
          footer: {
            text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • hoy a las ${joinTime}`
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
  if (welcomedMembers.has(member.id)) return;
  welcomedMembers.add(member.id);

  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const joinTime = member.joinedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

    channel.send({
      embeds: [{
        title: member.user.username, // Nombre del usuario
        description: `Bienvenido a Inactivos`,
        color: 0x000000,
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true, size: 64 }) }, // Foto de perfil pequeña
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • hoy a las ${joinTime}`
        }
      }]
    });
  } catch(err) {
    console.error(err);
  }
});

// Login del bot
client.login(TOKEN);
