// commands/menu.js
const fs = require('fs');
const sendMessage = require('../handles/sendMessage');

const menuCommand = (senderId) => {
    // Lire les fichiers dans le répertoire commands
    const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
    const commandNames = commandFiles.map(file => file.replace('.js', ''));
    
    // Formater le message
    const formattedMenu = commandNames
        .map((name, index) => `│ ${index + 1}. ${name}`)
        .join('\n');
    
    const reply = `
╭─────────────⭓
${formattedMenu}
├─────⭔
│ Page [ 1/1 ]  // Vous pouvez ajouter la logique de pagination si nécessaire
│ Actuellement, le bot a ${commandNames.length} commandes qui peuvent être utilisées
│ » Tapez menu <page> pour voir la liste des commandes
│ » Tapez menu pour voir les détails de l'utilisation de cette commande
├────────⭔
│ 💕❤Bruno❤💕
╰─────────────⭓`;

    // Envoyer le message au user
    sendMessage(senderId, reply);
};

module.exports = menuCommand;
