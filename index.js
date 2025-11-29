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
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LOGO_URL = process.env.LOGO_URL;

if (!TOKEN || !CHANNEL_ID) {
  console.error('Faltan variables de entorno TOKEN o CHANNEL_ID');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Evitar duplicados por si hay reinicios rápidos
const recentlyWelcomed = new Set();
const WELCOME_DEDUPE_MS = 30 * 1000;

client.once('ready', () => {
  console.log(`Bot listo! Conectado como ${client.user.tag}`);
});

// Comando de prueba !testbienvenida
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const canal = await message.guild.channels.fetch(CHANNEL_ID);
      if (!canal || !canal.isTextBased()) return message.channel.send('No encontré el canal de bienvenida.');

      const timestamp = Math.floor(Date.now() / 1000);

      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setTitle('Bienvenido a Inactivos')
        .setColor(0x000000)
        .setFooter({ text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • <t:${timestamp}:f>` });

      if (LOGO_URL) embed.setImage(LOGO_URL);

      await canal.send({ embeds: [embed] });
      message.channel.send('✅ Prueba de bienvenida enviada.');
    } catch (err) {
      console.error('Error en !testbienvenida:', err);
      message.channel.send('Ocurrió un error al enviar la bienvenida.');
    }
  }
});

// Bienvenida automática al unirse
client.on('guildMemberAdd', async member => {
  try {
    const canal = await member.guild.channels.fetch(CHANNEL_ID);
    if (!canal || !canal.isTextBased()) return;

    // Evitar duplicados
    if (recentlyWelcomed.has(member.id)) return;
    recentlyWelcomed.add(member.id);
    setTimeout(() => recentlyWelcomed.delete(member.id), WELCOME_DEDUPE_MS);

    const timestamp = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
      })
      .setTitle('Bienvenido a Inactivos')
      .setColor(0x000000)
      .setFooter({ text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • <t:${timestamp}:f>` });

    if (LOGO_URL) embed.setImage(LOGO_URL);

    await canal.send({ embeds: [embed] });
  } catch (err) {
    console.error('Error en guildMemberAdd:', err);
  }
});

client.login(TOKEN);
