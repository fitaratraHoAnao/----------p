const fs = require('fs-extra');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = commandFiles.map(file => file.replace('.js', ''));

const COMMANDS_PER_PAGE = 10;

module.exports = async (senderId, userText) => {
    const page = parseInt(userText.split(' ')[1]) || 1;
    const totalPages = Math.ceil(commands.length / COMMANDS_PER_PAGE);
    
    if (page < 1 || page > totalPages) {
        await sendMessage(senderId, `Page invalide. Veuillez choisir une page entre 1 et ${totalPages}.`);
        return;
    }

    const startIndex = (page - 1) * COMMANDS_PER_PAGE;
    const endIndex = startIndex + COMMANDS_PER_PAGE;
    const commandList = commands.slice(startIndex, endIndex);

    let response = "🇲🇬 *Liste des commandes disponibles :*\n\n";
    commandList.forEach((cmd, index) => {
        response += `${startIndex + index + 1}- ${cmd}\n   ✅ Description 👉: Description de la commande ${cmd}.\n   ✅ Usage 👉: Envoyez '${cmd}' pour l'utiliser.\n\n`;
    });

    response += `Page ${page}/${totalPages}\nUtilisez 'help <numéro de page>' pour naviguer.`;
    
    await sendMessage(senderId, response);
};

module.exports.info = {
    name: "help",
    description: "Affiche la liste des commandes disponibles avec pagination.",
    usage: "Envoyez 'help' pour voir les premières commandes ou 'help <numéro de page>' pour naviguer."
};
