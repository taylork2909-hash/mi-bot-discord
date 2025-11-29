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

// ------------------------------
// Bienvenida automática al entrar un nuevo miembro
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const now = DateTime.now();
    const joinTime = DateTime.fromJSDate(member.joinedAt).setZone(now.zoneName);

    let timeText;
    if (joinTime.hasSame(now, 'day')) {
      timeText = `hoy a las ${joinTime.toFormat('hh:mm a')}`;
    } else if (joinTime.hasSame(now.minus({ days: 1 }), 'day')) {
      timeText = `ayer a las ${joinTime.toFormat('hh:mm a')}`;
    } else {
      timeText = joinTime.toFormat('dd/MM/yyyy • hh:mm a');
    }

    await channel.send({
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${timeText}`
        }
      }],
      allowedMentions: { users: [member.id] }
    });

  } catch(err) {
    console.error(err);
  }
});

// ------------------------------
// Login del bot
// ------------------------------
client.login(TOKEN);
