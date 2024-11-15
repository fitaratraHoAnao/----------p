const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId) => {
    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => require(`./${file}`).info);

    // Construire le message de réponse
    let message = `🇲🇬 *Liste complète des commandes disponibles*:\n\n`;
    commands.forEach((command, index) => {
        message += `${index + 1}- ${command.name}\n`;
        message += `  ✅ Description 👉: ${command.description}\n`;
        message += `  ✅ Usage 👉: ${command.usage}\n\n`;
    });

    // Envoyer le message
    await sendMessage(senderId, message);
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles sans pagination.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes."
};
