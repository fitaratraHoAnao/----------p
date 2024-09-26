const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

const menuCommand = (senderId, prompt) => {
    const [menuCmd, commandName] = prompt.split(' ').map(str => str.trim());

    // Lire les fichiers dans le répertoire commands
    const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));

    if (commandName) {
        // Chercher une commande spécifique
        const commandFile = commandFiles.find(file => file.replace('.js', '') === commandName);

        if (commandFile) {
            // Charger la commande spécifique et afficher ses infos
            const command = require(path.join(__dirname, commandFile));
            const name = command.info ? command.info.name : commandName;
            const description = command.info ? command.info.description : 'Pas de description disponible';
            const usage = command.info ? command.info.usage : 'Pas d\'usage disponible';

            const reply = `
╭─────────────⭓
│ Commande : ${name}
│ Description : ${description}
│ Usage : ${usage}
╰─────────────⭓`;

            // Envoyer le message au user
            sendMessage(senderId, reply);
        } else {
            // Si la commande n'est pas trouvée
            sendMessage(senderId, `La commande "${commandName}" n'existe pas.`);
        }
    } else {
        // Afficher toutes les commandes disponibles si aucun nom de commande n'est spécifié
        const commandsInfo = commandFiles.map(file => {
            const command = require(path.join(__dirname, file));
            return {
                name: command.info ? command.info.name : file.replace('.js', ''),
                description: command.info ? command.info.description : 'Pas de description disponible',
                usage: command.info ? command.info.usage : 'Pas d\'usage disponible'
            };
        });

        // Formater le menu général
        const formattedMenu = commandsInfo
            .map((cmd, index) => `│ ${index + 1}. ${cmd.name} - ${cmd.description}\n   Usage: ${cmd.usage}`)
            .join('\n\n');
        
        const reply = `
╭─────────────⭓
${formattedMenu}
├─────⭔
│ Page [ 1/1 ]  // Vous pouvez ajouter la logique de pagination si nécessaire
│ Actuellement, le bot a ${commandsInfo.length} commandes qui peuvent être utilisées
│ » Tapez menu <nom de la commande> pour voir les détails de l'utilisation
├────────⭔
│ 💕❤Bruno❤💕
╰─────────────⭓`;

        // Envoyer le message au user
        sendMessage(senderId, reply);
    }
};

module.exports = menuCommand;
