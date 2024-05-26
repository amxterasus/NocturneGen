const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const config = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("📦 Shows the stock."),

  async execute(interaction) {
    let embed;

    if (interaction.channel.id === config.gen) {
      const stockDirectory = path.join(__dirname, "..", "..", "stock");

      try {
        const files = await fs.readdir(stockDirectory);

        if (files.length === 0) {
          embed = new EmbedBuilder()
            .setColor(config.color.red)
            .setTitle("No stock available!")
            .setDescription("There is no stock of any service at this time.")
            .setFooter({
              text: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL({
                dynamic: true,
                size: 64,
              }),
            })
            .setTimestamp();
        } else {
          const serviceDetails = await Promise.all(
            files
              .filter((file) => file.endsWith(".txt"))
              .map(async (file) => {
                const filePath = path.join(stockDirectory, file);
                const data = await fs.readFile(filePath, "utf-8");
                const accountCount = data
                  .split("\n")
                  .filter((line) => line.trim().length > 0).length;

                return {
                  name: file.replace(".txt", ""),
                  count: accountCount,
                };
              })
          );
          embed = new EmbedBuilder()
            .setColor(config.color.default)
            .setTitle(
              `${interaction.guild.name} has ${serviceDetails.length} services. 📦`
            )
            .setDescription(
              serviceDetails
                .map(({ name, count }) => `\`📖 - ${name}:\` **${count}**`)
                .join("\n")
            )
            .setFooter({
              text: interaction.user.username,
              iconURL: interaction.user.displayAvatarURL({
                dynamic: true,
                size: 64,
              }),
            })
            .setTimestamp();
        }

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error("Error reading the stock directory:", error);
        embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Error getting the stock!")
          .setDescription(
            "An error occurred while obtaining stock from the server."
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
    } else {
      embed = new EmbedBuilder()
        .setColor(config.color.red)
        .setTitle("Bad use of command!")
        .setDescription(
          `You can't use this command in this channel! Try it in <#${config.genFree}> channel!`
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
