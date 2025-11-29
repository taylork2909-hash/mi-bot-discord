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
// Bot de Discord (discord.js v14)
// ------------------------------
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');

const TOKEN = process.env.TOKEN;           // token del bot
const CHANNEL_ID = process.env.CHANNEL_ID; // id del canal de bienvenida
const LOGO_URL = process.env.LOGO_URL;     // imagen grande (logo) para setImage

if (!TOKEN) {
  console.error('ERROR: No se encontró TOKEN en las variables de entorno.');
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error('ERROR: No se encontró CHANNEL_ID en las variables de entorno.');
  process.exit(1);
}
if (!LOGO_URL) {
  console.warn('WARN: No se encontró LOGO_URL en las variables de entorno. La imagen grande no se mostrará.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // si va a usar comandos por mensaje
    GatewayIntentBits.GuildMembers
  ]
});

// Función para formatear la hora relativa "hoy a las HH:mm" o "ayer a las HH:mm"
function formatoHora(date) {
  if (!date) return 'fecha desconocida';
  const dt = DateTime.fromJSDate(date).setZone('local');
  const ahora = DateTime.local().setZone('local');

  if (dt.hasSame(ahora, 'day')) {
    return `hoy a las ${dt.toFormat('HH:mm')}`;
  } else if (dt.hasSame(ahora.minus({ days: 1 }), 'day')) {
    return `ayer a las ${dt.toFormat('HH:mm')}`;
  } else {
    return dt.toFormat('dd/MM/yyyy HH:mm');
  }
}

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Comandos por mensaje simple
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return; // ignorar DMs

  const content = message.content.trim().toLowerCase();

  if (content === '!hola') {
    return message.channel.send('¡Hola! El bot funciona correctamente ✅');
  }

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
      const channel = await message.guild.channels.fetch(CHANNEL_ID);
      if (!channel) return message.channel.send('No encontré el canal de bienvenida.');

      // usar joinedAt del miembro que ejecuta el comando (para test)
      const joinTime = formatoHora(message.member?.joinedAt);

      // construir embed con setAuthor para avatar pequeño a la izquierda
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.username, // puede usar message.author.tag si desea el #0000
          iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setDescription('Bienvenido a Inactivos')
        .setColor(0x2f3136)
        .setFooter({ text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • ${joinTime}` })
        .setTimestamp();

      // si hay LOGO_URL agregar imagen grande abajo
      if (LOGO_URL) embed.setImage(LOGO_URL);

      await channel.send({ embeds: [embed] });
      return message.channel.send('Embed de bienvenida enviado (test).');
    } catch (err) {
      console.error('Error en !testbienvenida:', err);
      return message.channel.send('Ocurrió un error al enviar la bienvenida.');
    }
  }
});

// Bienvenida automática al entrar un nuevo miembro
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if (!channel) {
      console.warn('Canal de bienvenida no encontrado para', member.guild.id);
      return;
    }

    // evitar doble envío (si el proceso se reinicia muy rapido)
    if (member._welcomed) return;
    member._welcomed = true;

    const joinTime = formatoHora(member.joinedAt);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.username,
        iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setDescription('Bienvenido a Inactivos')
      .setColor(0x2f3136)
      .setFooter({ text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${joinTime}` })
      .setTimestamp();

    if (LOGO_URL) embed.setImage(LOGO_URL);

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Error en guildMemberAdd:', err);
  }
});

// Login del bot
client.login(TOKEN).catch(err => {
  console.error('Fallo al loguear el bot:', err);
});
