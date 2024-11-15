const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage
const sendLongMessage = require('../handles/sendMessage').sendLongMessage;

module.exports = async (senderId) => {
    try {
        const commandsDir = path.join(__dirname);
        console.log('Chemin du répertoire des commandes :', commandsDir);

        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        console.log('Fichiers de commandes trouvés :', commandFiles);

        const commands = commandFiles.map(file => require(`./${file}`).info);
        console.log('Commandes chargées dans help :', commands);

        let message = `🇲🇬 *Liste complète des commandes disponibles*:\n\n`;
        commands.forEach((command, index) => {
            message += `${index + 1}- ${command.name}\n`;
            message += `  ✅ Description 👉: ${command.description}\n`;
            message += `  ✅ Usage 👉: ${command.usage}\n\n`;
        });

        await sendLongMessage(senderId, message);
    } catch (error) {
        console.error('Erreur dans la commande help :', error);
        await sendMessage(senderId, 'Désolé, une erreur est survenue lors de l\'exécution de la commande help.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles sans pagination.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes."
};
