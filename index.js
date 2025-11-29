// index.js
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
const LOGO_URL = process.env.LOGO_URL;     // imagen grande opcional (logo)

if (!TOKEN) {
  console.error('ERROR: No se encontro TOKEN en las variables de entorno.');
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error('ERROR: No se encontro CHANNEL_ID en las variables de entorno.');
  process.exit(1);
}
if (!LOGO_URL) {
  console.warn('WARN: No se encontro LOGO_URL en las variables de entorno. La imagen grande no se mostrara.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // solo si usa comandos por mensaje
    GatewayIntentBits.GuildMembers
  ]
});

// Formatea la hora como "hoy a las 2:29 pm", "ayer a las 2:29 pm" o "dd/MM/yyyy h:mm am/pm"
function formatoHora(date) {
  if (!date) return 'fecha desconocida';
  // crear DateTime en zona local
  const dt = DateTime.fromJSDate(date).setZone(DateTime.local().zoneName);
  const ahora = DateTime.local();

  // formateo 12h con am/pm en minuscula
  const hora12 = dt.toFormat('h:mm a').toLowerCase(); // e.g. "2:29 pm"

  if (dt.toISODate() === ahora.toISODate()) {
    return `hoy a las ${hora12}`;
  } else if (dt.toISODate() === ahora.minus({ days: 1 }).toISODate()) {
    return `ayer a las ${hora12}`;
  } else {
    // para fechas antiguas mantenemos 12h + fecha completa
    return `${dt.toFormat('dd/MM/yyyy')} ${dt.toFormat('h:mm a').toLowerCase()}`;
  }
}

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Comandos por mensaje simples (!hola, !reglas, !testbienvenida)
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
      const canal = await message.guild.channels.fetch(CHANNEL_ID);
      if (!canal || !canal.isTextBased()) return message.channel.send('No encontre el canal de bienvenida o no es un canal de texto.');

      // para test usamos el miembro que ejecuta el comando
      const usuario = message.author;
      const guild = message.guild;
      const joinTime = formatoHora(message.member?.joinedAt ?? new Date());

      const embed = new EmbedBuilder()
        .setAuthor({
          name: usuario.tag, // nombre#0000 (si prefiere solo username use usuario.username)
          iconURL: usuario.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setTitle('Bienvenido a Inactivos') // texto prominente (solo aqui)
        // descripcion removida para evitar duplicar "Bienvenido"
        .setColor(0x000000) // barra izquierda en negro
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

// Bienvenida automatica al entrar un nuevo miembro
client.on('guildMemberAdd', async member => {
  try {
    const canal = await member.guild.channels.fetch(CHANNEL_ID);
    if (!canal || !canal.isTextBased()) {
      console.warn('Canal de bienvenida no encontrado o no es texto para guild:', member.guild.id);
      return;
    }

    // evitar doble envio si el proceso se reinicia rapido
    if (member._welcomed) return;
    member._welcomed = true;

    const joinTime = formatoHora(member.joinedAt);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag, // nombre#0000
        iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTitle('Bienvenido a Inactivos')
      // descripcion removida para evitar texto repetido
      .setColor(0x000000) // barra izquierda en negro
      .setFooter({ text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • ${joinTime}` });

    if (LOGO_URL) embed.setImage(LOGO_URL);

    await canal.send({ embeds: [embed] });
  } catch (err) {
    console.error('Error en guildMemberAdd:', err);
  }
});

// Login del bot
client.login(TOKEN).catch(err => {
  console.error('Fallo al loguear el bot:', err);
});
