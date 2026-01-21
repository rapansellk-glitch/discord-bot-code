const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  EmbedBuilder
} = require('discord.js');

const fs = require('fs');

// ================== ตั้งค่า ==================
const TOKEN = 'MTQ2MzUxNDIwMDY4Mzk3MDY2Mg.GKE7kL.Rn7LtOw7_nQOD8NWATbQP8CMAwjoUEGR4VpuAU';
const ROLE_ID = '1463516925140144301';
const CHANNEL_ID = '1463523264356683923';
// =============================================

// โหลดโค้ด
let codes = {};
if (fs.existsSync('./codes.json')) {
  codes = JSON.parse(fs.readFileSync('./codes.json'));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// บอทออนไลน์
client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle('🎟️ รับยศด้วยโค้ด')
    .setDescription('กดปุ่มด้านล่างเพื่อใส่โค้ด\n\n1 โค้ด ใช้ได้ 1 คน')
    .setImage('https://mcdn.wallpapersafari.com/medium/28/48/pRYN4t.jpg')
    .setColor(0x2ecc71);

  const button = new ButtonBuilder()
    .setCustomId('openRedeem')
    .setLabel('กดเพื่อใส่โค้ด')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    embeds: [embed],
    components: [row]
  });
});

// รับ interaction
client.on(Events.InteractionCreate, async interaction => {

  // กดปุ่ม
  if (interaction.isButton()) {
    if (interaction.customId === 'openRedeem') {

      const modal = new ModalBuilder()
        .setCustomId('redeemModal')
        .setTitle('ใส่โค้ดรับยศ');

      const codeInput = new TextInputBuilder()
        .setCustomId('code')
        .setLabel('กรอกโค้ด')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(codeInput)
      );

      return interaction.showModal(modal);
    }
  }

  // กดยืนยันโค้ด
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'redeemModal') {

      const inputCode = interaction.fields.getTextInputValue('code');

      if (!codes[inputCode]) {
        return interaction.reply({
          content: '❌ โค้ดนี้ไม่ถูกต้อง',
          ephemeral: true
        });
      }

      if (codes[inputCode].used) {
        return interaction.reply({
          content: '❌ โค้ดนี้ถูกใช้ไปแล้ว',
          ephemeral: true
        });
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      await member.roles.add(ROLE_ID);

      codes[inputCode].used = true;
      fs.writeFileSync('./codes.json', JSON.stringify(codes, null, 2));

      return interaction.reply({
        content: '✅ รับยศเรียบร้อย!',
        ephemeral: true
      });
    }
  }
});

// กัน error เงียบ
process.on('unhandledRejection', error => {
  console.error('❌ Error:', error);
});

client.login(TOKEN);
