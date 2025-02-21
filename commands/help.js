const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');
const MAX_COMMANDS_PER_MESSAGE = 10; // Nombre maximum de commandes par message

// Fonction pour envoyer chaque bloc de messages avec un délai d'attente
async function sendCommandsInChunks(senderId, commands, page = 1) {
    const startIndex = (page - 1) * MAX_COMMANDS_PER_MESSAGE;
    const endIndex = startIndex + MAX_COMMANDS_PER_MESSAGE;
    const commandChunk = commands.slice(startIndex, endIndex);
    let message = "🇲🇬 *Liste des commandes disponibles :*\n\n";

    commandChunk.forEach((command, index) => {
        message += `${startIndex + index + 1}- ${command.name}\n`;
        message += `   ✅ Description 👉: ${command.description}\n`;
        message += `   ✅ Usage 👉: ${command.usage}\n\n`;
    });

    // Ajouter un message de navigation entre les pages
    const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_MESSAGE);
    message += `Page ${page}/${totalPages}\nUtilisez -help <numéro de page> pour naviguer.`;

    await sendMessage(senderId, message);
}

module.exports = async (senderId, args = []) => {
    try {
        const commandsDir = path.join(__dirname, 'commands'); // Diriger vers le répertoire contenant les commandes
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        
        // Charger les informations de chaque commande
        const commands = commandFiles.map(file => require(path.join(commandsDir, file)).info);

        // Vérifier la validité de la page
        const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_MESSAGE);
        let page = 1;

        if (args.length > 0 && !isNaN(args[0])) {
            page = Math.max(1, Math.min(parseInt(args[0]), totalPages));
        }

        // Vérifier la validité de la page
        if (page < 1 || page > totalPages) {
            return sendMessage(senderId, `Page invalide. Veuillez choisir une page entre 1 et ${totalPages}.`);
        }

        // Envoyer les commandes par blocs
        await sendCommandsInChunks(senderId, commands, page);
    } catch (error) {
        console.error('Erreur dans la commande help :', error);
        await sendMessage(senderId, 'Désolé, une erreur est survenue lors de l\'exécution de la commande help.');
    }
};

// Ajouter les informations de la commande help
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles en les envoyant par blocs.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes par blocs."
};
