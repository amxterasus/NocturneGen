const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("🛠️ Creates a new service in stock.")
    .addStringOption((option) =>
      option
        .setName("service")
        .setDescription("The name of the service to create.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.channel.id === config.gen) {
      if (!config.allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Permission denied.")
          .setDescription("You don't have permissions to use this command.")
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              size: 64,
            }),
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const service = interaction.options.getString("service");
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "stock",
        `${service}.txt`
      );

      try {
        await fs.writeFile(filePath, "");

        const embed = new EmbedBuilder()
          .setColor(config.color.green)
          .setTitle("Service successfully created! 🛠️")
          .setDescription(`New service \`${service}\` created!`)
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              size: 64,
            }),
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Generator error!")
          .setDescription(`Service \`${service}\` does not exist!`)
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              size: 64,
            }),
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }
    } else {
      embed = new EmbedBuilder()
        .setColor(config.color.red)
        .setTitle("Bad use of command!")
        .setDescription(
          `You can't use this command in this channel! Try it in <#${config.gen}> channel!`
        )
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL({
            dynamic: true,
            size: 64,
          }),
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
