const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,

  async execute(client) {
    await client.user.setPresence({
      activities: [
        {
          name: "/gen",
          type: ActivityType.Watching,
        },
      ],
      status: "idle",
    });

    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
