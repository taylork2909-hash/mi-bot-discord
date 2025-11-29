// ------------------------------
// Mini servidor para Render (NO BORRAR)
// ------------------------------
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Inactivos corriendo');
});

app.listen(PORT, () => {
  console.log(`Servidor web escuchando en el puerto ${PORT}`);
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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// ------------------------------
// Función para hora local del servidor (solo arreglar estilo)
// ------------------------------
function formatearHora(fecha) {
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatearFecha(fecha) {
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

  if (diferenciaDias === 0) {
    return `hoy a las ${formatearHora(fecha)}`;
  } else if (diferenciaDias === 1) {
    return `ayer a las ${formatearHora(fecha)}`;
  } else {
    return fecha.toLocaleDateString('es-ES') + ` a las ${formatearHora(fecha)}`;
  }
}

// ------------------------------
// Comando de prueba (!testbienvenida)
// ------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return; // Ignorar bots
  if (!message.guild) return; // Ignorar mensajes privados
  if (message.content !== '!testbienvenida') return; // SOLO si tú escribes esto

  const channel = await message.guild.channels.fetch(CHANNEL_ID);
  if (!channel) return message.channel.send('No encontré el canal de bienvenida.');

  const ahora = new Date();
  const fechaFormateada = formatearFecha(ahora);

  channel.send({
    embeds: [{
      title: `Bienvenido a Inactivos`,
      description: `<@${message.author.id}>`, // AQUÍ sí funciona la mención
      color: 0x000000,
      image: { url: LOGO_URL },
      footer: {
        text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • ${fechaFormateada}`
      }
    }]
  });
});

// ------------------------------
// Bienvenida real al unirse
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const ahora = new Date();
    const fechaFormateada = formatearFecha(ahora);

    channel.send({
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>`, // AQUÍ sí menciona al usuario correctamente
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${fechaFormateada}`
        }
      }]
    });

  } catch (err) {
    console.error(err);
  }
});

client.login(TOKEN);
