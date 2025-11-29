// ------------------------------
// Mini servidor web para Render
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
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder 
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const LOGO_URL = process.env.LOGO_URL;

// ------------------------------
// Funcion para fecha simple DD/MM/YYYY
// ------------------------------
function obtenerFechaSimple() {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const ano = ahora.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ------------------------------
// Crear embed de bienvenida
// ------------------------------
function crearEmbedBienvenida(user, guild) {
  const fecha = obtenerFechaSimple();

  return new EmbedBuilder()
    .setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL({ dynamic: true, size: 64 })
    })
    .setTitle("Bienvenido a Inactivos")
    .setDescription(`Gracias por unirte, somos ahora ${guild.memberCount} miembros • ${fecha}`)
    .setColor(0x000000)
    .setImage(LOGO_URL);
}

// ------------------------------
// Comando de prueba
// ------------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!testbienvenida') {
    try {
      const canal = await message.guild.channels.fetch(CHANNEL_ID);
      if (!canal) return message.reply("No encontre el canal de bienvenida.");

      const embed = crearEmbedBienvenida(message.author, message.guild);
      await canal.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("Ocurrio un error al enviar la bienvenida.");
    }
  }
});

// ------------------------------
// Bienvenida automatica
// ------------------------------
client.on('guildMemberAdd', async member => {
  try {
    const canal = await member.guild.channels.fetch(CHANNEL_ID);
    if (!canal) return;

    const embed = crearEmbedBienvenida(member.user, member.guild);
    await canal.send({ embeds: [embed] });

  } catch (err) {
    console.error(err);
  }
});

// ------------------------------
// Login del bot
// ------------------------------
client.login(TOKEN);
