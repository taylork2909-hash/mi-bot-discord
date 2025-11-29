// index.js
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
// Bot de Discord (discord.js v14)
// ------------------------------
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LOGO_URL = process.env.LOGO_URL;

if (!TOKEN) {
  console.error('ERROR: No se encontro TOKEN en las variables de entorno.');
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error('ERROR: No se encontro CHANNEL_ID en las variables de entorno.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// dedupe temporal: evita enviar bienvenida doble en X segundos
const recentlyWelcomed = new Set();
const WELCOME_DEDUPE_MS = 30 * 1000; // 30 segundos

function formatoHora(date) {
  if (!date) return 'fecha desconocida';
  const dt = DateTime.fromJSDate(date).setZone(DateTime.local().zoneName);
  const ahora = DateTime.local();
  const hora12 = dt.toFormat('h:mm a').toLowerCase();

  if (dt.toISODate() === ahora.toISODate()) {
    return `hoy a las ${hora12}`;
  } else if (dt.toISODate() === ahora.minus({ days: 1 }).toISODate()) {
    return `ayer a las ${hora12}`;
  } else {
    return `${dt.toFormat('dd/MM/yyyy')} ${dt.toFormat('h:mm a').toLowerCase()}`;
  }
}

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag} (pid ${process.pid})`);
  console.log('listeners guildMemberAdd:', client.listeners('guildMemberAdd').length);
});

// Comandos basicos
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  const content = message.content.trim().toLowerCase();

  if (content === '!hola') return message.channel.send('¡Hola! El bot funciona correctamente ✅');
  if (content === '!reglas') {
    return message.channel.send(`
**Reglas del servidor**
1. Se respetuoso
2. No hagas spam
3. No NSFW
4. Evita drama
5. Sigue las instrucciones del staff
    `);
  }

  if (content === '!testbienvenida') {
    try {
      const canal = await message.guild.channels.fetch(CHANNEL_ID);
      if (!canal || !canal.isTextBased()) return message.channel.send('No encontre el canal de bienvenida o no es un canal de texto.');

      const usuario = message.author;
      const guild = message.guild;
      const joinTime = formatoHora(message.member?.joinedAt ?? new Date());

      const embed = new EmbedBuilder()
        .setAuthor({
          name: usuario.tag,
          iconURL: usuario.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setTitle('Bienvenido a Inactivos')
        .setColor(0x000000) // barra izquierda negra
        .setFooter({ text: `Gracias por unirte, somos ahora ${guild.memberCount} miembros • ${joinTime}` });

      if (LOGO_URL) embed.setImage(LOGO_URL);

      await canal.send({ embeds: [embed] });
      return message.channel.send('Embed de bienvenida enviado (test).');
    } catch (err) {
      console.error('Error en !testbienvenida:', err);
      return message.channel.send('Ocurrio un error al enviar la bienvenida.');
    }
  }
});

// Handler de bienvenida con dedupe y logs
client.on('guildMemberAdd', async member => {
  try {
    console.log('[guildMemberAdd] evento recibido para', member.id, 'pid', process.pid, 'hora', new Date().toISOString());

    // dedupe: si ya enviamos recientemente, ignorar
    if (recentlyWelcomed.has(member.id)) {
      console.log('[guildMemberAdd] ignorado por dedupe:', member.id);
      return;
    }
    recentlyWelcomed.add(member.id);
    setTimeout(() => recentlyWelcomed.delete(member.id), WELCOME_DEDUPE_MS);

    const canal = await member.guild.channels.fetch(CHANNEL_ID);
    if (!canal || !canal.isTextBased()) {
      console.warn('Canal de bienvenida no encontrado o no es texto para guild:', member.guild.id);
      return;
    }

    const joinTime = formatoHora(member.joinedAt);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTitle('Bienvenido a Inactivos')
      .setColor(0x000000)
      .setFooter({ text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${joinTime}` });

    if (LOGO_URL) embed.setImage(LOGO_URL);

    await canal.send({ embeds: [embed] });
    console.log('[guildMemberAdd] embed enviado para', member.id);
  } catch (err) {
    console.error('Error en guildMemberAdd:', err);
  }
});

client.login(TOKEN).catch(err => {
  console.error('Fallo al loguear el bot:', err);
});
