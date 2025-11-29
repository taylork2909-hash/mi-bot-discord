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

// Convierte una fecha a timestamp UNIX
function getUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Enviar bienvenida (función reutilizable)
async function sendWelcome(member) {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const unixTime = getUnix(member.joinedAt);

    channel.send({
      content: `<@${member.id}>`, 
      allowed_mentions: { users: [member.id] },
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `¡Nos alegra tenerte aquí!`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Se unió • <t:${unixTime}:f>`
        }
      }]
    });

  } catch (err) {
    console.error(err);
  }
}

// Comando !testbienvenida
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!testbienvenida') {
    sendWelcome(message.member);
  }

  if (message.content.toLowerCase() === '!hola') {
    message.reply('¡Hola! El bot funciona correctamente ✅');
  }
});

// Evento cuando entra un nuevo usuario
client.on('guildMemberAdd', sendWelcome);

client.login(TOKEN);
