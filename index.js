const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ❗ ใช้ TOKEN จาก Railway เท่านั้น
const TOKEN = process.env.TOKEN;

// ❗ ใส่ ID ของยศ
const ROLE_ID = 'PUT_ROLE_ID_HERE';

// ❗ ใส่ ID ของห้องที่จะส่งข้อความ
const CHANNEL_ID = 'PUT_CHANNEL_ID_HERE';

// โหลดโค้ด
let codes = {};
if (fs.existsSync('./codes.json')) {
  codes = JSON.parse(fs.readFileSync('./codes.json'));
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // ส่งข้อความ + รูป + ปุ่ม
  const channel = await client.channels.fetch(CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setTitle('🎁 รับยศด้วยโค้ด')
    .setDescription('กดปุ่มด้านล่างเพื่อกรอกโค้ดรับยศ')
    .setImage('https://i.imgur.com/yourimage.png') // ใส่ลิงก์รูป
    .setColor(0x00ff00);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_redeem')
      .setLabel('รับยศ')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({
    embeds: [embed],
    components: [row]
  });
});

// จัดการ interaction
client.on(Events.InteractionCreate, async interaction => {

  // กดปุ่ม
  if (interaction.isButton() && interaction.customId === 'open_redeem') {
    const modal = new ModalBuilder()
      .setCustomId('redeem_modal')
      .setTitle('กรอกโค้ดรับยศ');

    const codeInput = new TextInputBuilder()
      .setCustomId('code')
      .setLabel('ใส่โค้ด')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(codeInput)
    );

    await interaction.showModal(modal);
  }

  // ส่งโค้ด
  if (interaction.isModalSubmit() && interaction.customId === 'redeem_modal') {
    const inputCode = interaction.fields.getTextInputValue('code');

    if (!codes[inputCode]) {
      return interaction.reply({ content: '❌ โค้ดไม่ถูกต้อง', ephemeral: true });
    }

    if (codes[inputCode].used) {
      return interaction.reply({ content: '❌ โค้ดนี้ถูกใช้ไปแล้ว', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(ROLE_ID);

    codes[inputCode].used = true;
    fs.writeFileSync('./codes.json', JSON.stringify(codes, null, 2));

    await interaction.reply({ content: '✅ รับยศเรียบร้อย!', ephemeral: true });
  }
});

client.login(TOKEN);
