const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("🛒 Adds an account to a service.")
    .addStringOption((option) =>
      option
        .setName("service")
        .setDescription("The service to add the account to.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("account")
        .setDescription("The account to add.")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.channel.id === config.gen) {
      const service = interaction.options.getString("service");
      const account = interaction.options.getString("account");

      if (!config.allowedUsers.includes(interaction.user.id)) {
        const embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Permission Denied.")
          .setDescription("You don't have permissions to use this command. ")
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

      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "stock",
        `${service}.txt`
      );

      try {
        await fs.access(filePath, fs.constants.F_OK);
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Error")
          .setDescription(`The service \`${service}\` doesn't exist.`)
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

      await fs.appendFile(filePath, `${os.EOL}${account}`);

      const embed = new EmbedBuilder()
        .setColor(config.color.green)
        .setTitle("Account added successfully! 🛒")
        .setDescription(
          `The account \`${account}\` was successfully added to the \`${service}\` service!`
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
    } else {
      const embed = new EmbedBuilder()
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
