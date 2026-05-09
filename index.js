const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1501906825681833994';
const GUILD_ID = '1331762341074702337';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [

  new SlashCommandBuilder()
    .setName('createclan')
    .setDescription('Create a clan')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Clan name')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('deleteclan')
    .setDescription('Delete your clan')

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('Slash commands registered.');

  } catch (error) {
    console.error(error);
  }
})();

client.once('clientReady', () => {
  console.log('BOT ONLINE');
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  // CREATE CLAN
  if (interaction.commandName === 'createclan') {

    await interaction.deferReply();

    try {

      const clanName = interaction.options.getString('name');

      const roleName = `[CLAN] ${clanName}`;

      const existingRole = interaction.guild.roles.cache.find(
        role => role.name.toLowerCase() === roleName.toLowerCase()
      );

      if (existingRole) {
        return interaction.editReply('❌ That clan already exists!');
      }

      // Create clan role
      const clanRole = await interaction.guild.roles.create({
        name: roleName,
        reason: 'Clan created'
      });

      // Give clan role
      try {
        await interaction.member.roles.add(clanRole);
      } catch (err) {
        console.log('Could not give clan role');
      }

      // Give Clan Leader role
      const clanLeaderRole = interaction.guild.roles.cache.find(
        role => role.name === 'Clan Leader'
      );

      if (clanLeaderRole) {
        try {
          await interaction.member.roles.add(clanLeaderRole);
        } catch (err) {
          console.log('Could not give Clan Leader role');
        }
      }

      await interaction.editReply(`🎮 Clan "${clanName}" created!`);

    } catch (error) {

      console.error(error);

      await interaction.editReply('❌ Error creating clan.');
    }
  }

  // DELETE CLAN
  if (interaction.commandName === 'deleteclan') {

    await interaction.deferReply();

    try {

      const clanRole = interaction.member.roles.cache.find(
        role => role.name.startsWith('[CLAN]')
      );

      if (!clanRole) {
        return interaction.editReply('❌ You do not own a clan!');
      }

      // Remove clan role
      try {
        await interaction.member.roles.remove(clanRole);
      } catch (err) {
        console.log('Could not remove clan role');
      }

      // Delete clan role
      try {
        await clanRole.delete();
      } catch (err) {
        console.log('Could not delete clan role');
      }

      await interaction.editReply('🗑️ Clan deleted!');

    } catch (error) {

      console.error(error);

      await interaction.editReply('❌ Error deleting clan.');
    }
  }
});

client.login(process.env.TOKEN);