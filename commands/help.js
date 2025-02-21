const fs = require('fs-extra');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

// Charger dynamiquement toutes les commandes du répertoire 'commands'
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

const commandsList = commandFiles.map(file => {
    const command = require(`../commands/${file}`);
    return { 
        name: command.info?.name || file.replace('.js', ''), 
        description: command.info?.description || "Pas de description disponible.", 
        usage: command.info?.usage || "Pas d'usage spécifié." 
    };
});

const COMMANDS_PER_PAGE = 10;

const helpCommand = async (senderId, commandPrompt) => {
    const totalPages = Math.ceil(commandsList.length / COMMANDS_PER_PAGE);
    let page = parseInt(commandPrompt, 10) || 1;

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * COMMANDS_PER_PAGE;
    const endIndex = startIndex + COMMANDS_PER_PAGE;
    const commandsToShow = commandsList.slice(startIndex, endIndex);

    let message = `🇲🇬 *Liste des commandes disponibles (Page ${page}/${totalPages})* :\n\n`;
    commandsToShow.forEach((cmd, index) => {
        message += `${startIndex + index + 1}- ${cmd.name}\n   ✅ Description 👉: ${cmd.description}\n   ✅ Usage 👉: ${cmd.usage}\n\n`;
    });

    message += `📄 Page (${page}/${totalPages})\nUtilisez 'help <numéro de page>' pour naviguer.`;

    await sendMessage(senderId, message);
};

module.exports = helpCommand;
