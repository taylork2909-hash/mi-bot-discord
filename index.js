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

      const joinTime = DateTime.now().setZone('America/Bogota').toFormat('dd/MM/yyyy HH:mm');

      channel.send({
        content: `**Bienvenido a Inactivos**\n${message.author.username}\nGracias por unirte, somos ahora ${message.guild.memberCount} miembros • hoy a las ${joinTime}`,
        allowedMentions: { parse: [] },
      });
    } catch(err) {
      console.error(err);
      message.channel.send('Ocurrió un error al enviar la bienvenida.');
    }
  }
});

// Bienvenida automática al entrar un nuevo miembro
client.on('guildMemberAdd', async member => {
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const joinTime = DateTime.now().setZone('America/Bogota').toFormat('HH:mm');

    channel.send({
      content: `**Bienvenido a Inactivos**\n${member.user.username}\nGracias por unirte, somos ahora ${member.guild.memberCount} miembros • hoy a las ${joinTime}`,
      allowedMentions: { parse: [] }, // evita menciones extra
    });
  } catch(err) {
    console.error(err);
  }
});

client.login(TOKEN);
