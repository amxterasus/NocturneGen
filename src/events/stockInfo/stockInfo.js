const { Events, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../../config.json");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client, interaction) {
    const stockDirectory = path.join(__dirname, "..", "..", "stock");

    const channel = client.channels.cache.get(config.restock);

    if (!channel) {
      console.log(`I couldn't find the channel with the id ${config.restock}`);
    }

    fs.watch(stockDirectory, (eventType, filename) => {
      if (filename.endsWith(".txt") && eventType === "rename") {
        const stockName = path.basename(stockDirectory);
        const service = filename.replace(".txt", "");

        let action;

        if (!fs.existsSync(path.join(stockDirectory, filename))) {
          action = "Deleted";
        } else {
          action = "Created";
        }

        const embed = new EmbedBuilder()
          .setColor(config.color.default)
          .setTitle("Information of the new stock! 📚")
          .setDescription(
            `\`📚 - Generator:\` **${
              stockName[0].toUpperCase() + stockName.slice(1).toLowerCase()
            } free**\n\`📖 - Service:\` **${
              service[0].toUpperCase() + service.slice(1).toLowerCase()
            }**\n\`${
              action === "Deleted" ? "🗑️" : "🛠️"
            } - Action:\` **${action}**`
          )
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              size: 64,
            }),
          })
          .setTimestamp();

        channel.send({ embeds: [embed] });
      }
    });
  },
};
