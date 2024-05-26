const ascii = require("ascii-table");
const fs = require("fs");

async function loadEvents(client) {
    const table = new ascii().setHeading("events", "Status");
    await client.events.clear();

    const eventFolder = fs.readdirSync("./src/events");

    for (const folder of eventFolder) {
        const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith("js"));

        for (const file of eventFiles) {
            const eventFile = require(`../../events/${folder}/${file}`);
            const eventHandler = (...args) => eventFile.execute(...args, client);

            const eventEmitter = eventFile.rest ? client.rest : client;
            const eventName = eventFile.name;
            const eventMethod = eventFile.once ? eventEmitter.once : eventEmitter.on;

            eventMethod.call(eventEmitter, eventName, eventHandler);
            table.addRow(file, "loaded");
        }
    }

    console.log(table.toString(), "\nLoaded Events");
}

module.exports = { loadEvents };