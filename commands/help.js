const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');
const MAX_COMMANDS_PER_PAGE = 10; // Nombre maximum de commandes par page

// Fonction pour envoyer la page spécifiée
async function sendCommandsPage(senderId, commands, page) {
    const startIndex = (page - 1) * MAX_COMMANDS_PER_PAGE;
    const endIndex = startIndex + MAX_COMMANDS_PER_PAGE;
    const commandChunk = commands.slice(startIndex, endIndex);

    let message = "🇲🇬 *Liste des commandes disponibles :*\n\n";
    commandChunk.forEach((command, index) => {
        message += `${startIndex + index + 1}- ${command.name}\n`;
        message += `   ✅ Description 👉: ${command.description}\n`;
        message += `   ✅ Usage 👉: ${command.usage}\n\n`;
    });

    const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_PAGE);
    message += `Page ${page}/${totalPages}\nUtilisez -help <numéro de page> pour naviguer.`;

    await sendMessage(senderId, message);
}

module.exports = async (senderId, page = 1) => {
    try {
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

        // Charger les informations de chaque commande
        const commands = commandFiles.map(file => require(`./${file}`).info);

        const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_PAGE);
        if (page < 1 || page > totalPages) {
            return await sendMessage(senderId, `Page invalide. Veuillez choisir un numéro de page entre 1 et ${totalPages}.`);
        }

        // Envoie la page des commandes demandée
        await sendCommandsPage(senderId, commands, page);
    } catch (error) {
        console.error('Erreur dans la commande help :', error);
        await sendMessage(senderId, 'Désolé, une erreur est survenue lors de l\'exécution de la commande help.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles en les envoyant par blocs.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes par blocs ou 'help <numéro de page>' pour naviguer."
};
