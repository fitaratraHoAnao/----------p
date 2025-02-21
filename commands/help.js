const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');
const MAX_COMMANDS_PER_PAGE = 10; // Nombre maximum de commandes par page

// Fonction pour envoyer chaque page de commandes
async function sendCommandsPage(senderId, commands, pageNumber) {
    const start = (pageNumber - 1) * MAX_COMMANDS_PER_PAGE;
    const end = start + MAX_COMMANDS_PER_PAGE;
    const commandChunk = commands.slice(start, end);
    
    let message = "🇲🇬 *Liste des commandes disponibles :*\n\n";

    commandChunk.forEach((command, index) => {
        message += `${start + index + 1}- ${command.name}\n`;
        message += `   ✅ Description 👉: ${command.description}\n`;
        message += `   ✅ Usage 👉: ${command.usage}\n\n`;
    });

    const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_PAGE);
    message += `Page ${pageNumber}/${totalPages}\n`;
    message += "Utilisez -help <numéro de page> pour naviguer.";

    await sendMessage(senderId, message);
}

// Fonction principale pour gérer la commande 'help'
module.exports = async (senderId, pageNumber = 1) => {
    try {
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        
        // Charger les informations de chaque commande
        const commands = commandFiles.map(file => require(`./${file}`).info);

        // Vérifier si la page demandée est valide
        const totalPages = Math.ceil(commands.length / MAX_COMMANDS_PER_PAGE);
        if (pageNumber < 1 || pageNumber > totalPages) {
            await sendMessage(senderId, `Page ${pageNumber} non disponible. Veuillez entrer un numéro de page valide.`);
            return;
        }

        await sendCommandsPage(senderId, commands, pageNumber);
    } catch (error) {
        console.error('Erreur dans la commande help :', error);
        await sendMessage(senderId, 'Désolé, une erreur est survenue lors de l\'exécution de la commande help.');
    }
};

// Ajouter les informations de la commande 'help'
module.exports.info = {
    name: "help",
    description: "Affiche la liste complète des commandes disponibles en les envoyant par blocs.",
    usage: "Envoyez 'help' pour voir la liste complète des commandes par blocs, ou 'help <numéro de page>' pour naviguer entre les pages."
};
