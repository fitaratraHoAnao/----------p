const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, page) => {
    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    const commands = commandFiles.map(file => require(`./${file}`).info);

    const commandsPerPage = 10;
    const pageNumber = parseInt(page) || 1;
    const totalPages = Math.ceil(commands.length / commandsPerPage);

    // Vérifier si la page demandée est valide
    if (pageNumber < 1 || pageNumber > totalPages) {
        await sendMessage(senderId, `Page invalide. Veuillez choisir une page entre 1 et ${totalPages}.`);
        return;
    }

    // Déterminer les commandes à afficher pour la page courante
    const startIndex = (pageNumber - 1) * commandsPerPage;
    const endIndex = Math.min(startIndex + commandsPerPage, commands.length);
    const commandsToShow = commands.slice(startIndex, endIndex);

    // Construire le message de réponse
    let message = `🇲🇬 *Liste des commandes 🇲🇬 (page ${pageNumber}/${totalPages})*:\n\n`;
    commandsToShow.forEach((command, index) => {
        message += `${startIndex + index + 1}- ${command.name}\n`;
        message += `  ✅ Description 👉: ${command.description}\n`;
        message += `  ✅ Usage 👉: ${command.usage}\n\n`;
    });

    // Indiquer comment naviguer vers les pages suivantes/précédentes
    if (pageNumber < totalPages) {
        message += `Envoyez "help ${pageNumber + 1}" pour voir la page suivante.`;
    } else {
        message += `Vous êtes sur la dernière page.`;
    }

    await sendMessage(senderId, message);
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste des commandes disponibles avec une pagination.",
    usage: "Envoyez 'help' pour voir la liste des commandes ou 'help <numéro_page>' pour naviguer."
};
