const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');
const MAX_COMMANDS_PER_MESSAGE = 10; // Nombre maximum de commandes par message

// Fonction pour envoyer chaque bloc de messages avec un délai d'attente
async function sendCommandsInChunks(senderId, commands) {
    for (let i = 0; i < commands.length; i += MAX_COMMANDS_PER_MESSAGE) {
        const commandChunk = commands.slice(i, i + MAX_COMMANDS_PER_MESSAGE);
        let message = "🇲🇬 *Liste des commandes disponibles :*\n\n";

        commandChunk.forEach((command, index) => {
            message += `${i + index + 1}- ${command.name}\n`;
            message += `   ✅ Description 👉: ${command.description}\n`;
            message += `   ✅ Usage 👉: ${command.usage}\n\n`;
        });

        await sendMessage(senderId, message);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Attente de 1 seconde avant l'envoi du prochain bloc
    }
}

module.exports = async (senderId) => {
    try {
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        
        // Charger les informations de chaque commande
        const commands = commandFiles.map(file => require(`./${file}`).info);

        await sendCommandsInChunks(senderId, commands);
    } catch (error) {
        console.error('Erreur dans la commande help :', error);
        await sendMessage(senderId, 'Désolé, une erreur est survenue lors de l\'exécution de la commande help.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles en les envoyant par blocs.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes par blocs."
};
