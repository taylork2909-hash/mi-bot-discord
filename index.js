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

      const joinTime = message.member.joinedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

      channel.send({
        embeds: [{
          title: `Bienvenido a Inactivos`,
          description: `<@${message.author.id}>`,
          color: 0x000000,
          image: { url: LOGO_URL },
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
  try {
    const channel = await member.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return;

    const joinTime = member.joinedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

    channel.send({
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `<@${member.id}>`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${member.guild.memberCount} miembros • hoy a las ${joinTime}`
        }
      }]
    });
  } catch(err) {
    console.error(err);
  }
});

client.login(TOKEN);