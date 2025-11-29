if(message.content.toLowerCase() === '!testbienvenida') {
  try {
    const channel = await message.guild.channels.fetch(CHANNEL_ID);
    if(!channel) return message.channel.send('No encontré el canal de bienvenida.');

    const now = DateTime.now();
    const joinTime = DateTime.fromJSDate(message.member.joinedAt).setZone(now.zoneName);

    let timeText;
    if (joinTime.hasSame(now, 'day')) {
      timeText = `hoy a las ${joinTime.toFormat('hh:mm a')}`;
    } else if (joinTime.hasSame(now.minus({ days: 1 }), 'day')) {
      timeText = `ayer a las ${joinTime.toFormat('hh:mm a')}`;
    } else {
      timeText = joinTime.toFormat('dd/MM/yyyy • hh:mm a');
    }

    await channel.send({
      content: `<@${message.author.id}>`,
      embeds: [{
        title: `Bienvenido a Inactivos`,
        description: `Disfruta tu estadía en el servidor!`,
        color: 0x000000,
        image: { url: LOGO_URL },
        footer: {
          text: `Gracias por unirte, somos ahora ${message.guild.memberCount} miembros • ${timeText}`
        }
      }],
      allowedMentions: { users: [message.author.id] }
    });

  } catch(err) {
    console.error(err);
    message.channel.send('Ocurrió un error al enviar la bienvenida de prueba.');
  }
}
