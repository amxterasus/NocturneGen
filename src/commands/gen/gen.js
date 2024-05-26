const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
const config = require("../../config.json");
const generated = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gen")
    .setDescription("🔧 Generates an account from the stock.")
    .addStringOption((option) =>
      option.setName("service").setDescription("The service.").setRequired(true)
    ),

  async execute(interaction) {
    let embed;

    const genAccess = interaction.member.roles.cache.has(config.genRol);

    if (!genAccess) {
      embed = new EmbedBuilder()
        .setColor(config.color.red)
        .setTitle("Permission denied!")
        .setDescription("You don't have the necessary rol to execute this command.")
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

    if (interaction.channel.id === config.gen && genAccess) {
      if (generated.has(interaction.user.id)) {
        const cooldownHours = config.genCooldown / 3600000;
        embed = new EmbedBuilder()
          .setColor(config.color.red)
          .setTitle("Cooldown!")
          .setDescription(
            `Please wait **${cooldownHours} hour** before executing this command again.`
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
        const service = interaction.options.getString("service");

        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "stock",
          `${service}.txt`
        );

        try {
          let data = await fs.readFile(filePath, "utf-8");

          const position = data.indexOf("\n");
          const lines = data.split("\n").filter((line) => line.trim());
          const firstLine = lines[0];

          if (position === -1) {
            embed = new EmbedBuilder()
              .setColor(config.color.red)
              .setTitle("Generator error!")
              .setDescription(
                `I can't find the service \`${service}\` in my stock!`
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
          } else if (data.trim() === "") {
            embed = new EmbedBuilder()
              .setColor(config.color.red)
              .setTitle("Generator error!")
              .setDescription(
                `There are no accounts left in the \`${service}\` service!`
              );

            await interaction.reply({ embeds: [embed] });
          } else {
            embed = new EmbedBuilder()
              .setColor(config.color.green)
              .setTitle("Account generated! 🧬")
              .addFields(
                {
                  name: "Service",
                  value: `\`${service[0].toUpperCase()}${service
                    .slice(1)
                    .toLowerCase()}\``,
                  inline: true,
                },
                {
                  name: "Account",
                  value: `\`${firstLine}\``,
                  inline: true,
                }
              )
              .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({
                  dynamic: true,
                  size: 64,
                }),
              })
              .setTimestamp();

            await interaction.user.send({ embeds: [embed] });

            lines.shift();
            data = lines.join("\n");
            await fs.writeFile(filePath, data);

            embed = new EmbedBuilder()
              .setColor(config.color.green)
              .setTitle("Account generated succesfully! 🧬")
              .setDescription(`Check your private ${interaction.user}!`)
              .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL({
                  dynamic: true,
                  size: 64,
                }),
              })
              .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            generated.add(interaction.user.id);

            setTimeout(() => {
              generated.delete(interaction.user.id);
            }, config.genCooldown);
          }
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
