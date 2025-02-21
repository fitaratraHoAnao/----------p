const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));
const commands = commandFiles.map(file => {
    const command = require(`./${file}`);
    return {
        name: command.info.name,
        description: command.info.description,
        usage: command.info.usage
    };
});

const ITEMS_PER_PAGE = 10;

module.exports = async (senderId, userText) => {
    const page = parseInt(userText.split(' ')[1]) || 1;
    const totalPages = Math.ceil(commands.length / ITEMS_PER_PAGE);

    if (page < 1 || page > totalPages) {
        await sendMessage(senderId, `Page invalide. Veuillez choisir entre 1 et ${totalPages}.`);
        return;
    }

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const commandList = commands.slice(start, end)
        .map((cmd, index) => `${start + index + 1}- ${cmd.name}
   ✅ Description 👉: ${cmd.description}
   ✅ Usage 👉: ${cmd.usage}
`).join('\n\n');

    const message = `🇲🇬 *Liste des commandes disponibles :*\n\n${commandList}\n\nPage ${page}/${totalPages}\nUtilisez 'help <numéro de page>' pour naviguer.`;

    await sendMessage(senderId, message);
};

module.exports.info = {
    name: "help",
    description: "Affiche la liste des commandes disponibles avec pagination.",
    usage: "Envoyez 'help' pour voir les commandes ou 'help <numéro de page>' pour naviguer."
};
