const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    const [menuCmd, commandName] = prompt.split(' ').map(str => str.trim()); // Extraire le nom de la commande (si spécifié)

    try {
        // Lire les fichiers dans le répertoire "commands"
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
                await sendMessage(senderId, reply);
            } else {
                // Si la commande n'est pas trouvée
                await sendMessage(senderId, `La commande "${commandName}" n'existe pas.`);
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
│ 🇲🇬 Voici les menus disponibles 🇲🇬:
│ 
${formattedMenu}
├─────⭔
│ Page [ 1/1 ]
│ Actuellement, le bot a ${commandsInfo.length} commandes qui peuvent être utilisées
│ » Tapez menu <nom de la commande> pour voir les détails de l'utilisation
├────────⭔
│ 💕❤Bruno❤💕
╰─────────────⭓`;

            // Envoyer le message au user
            await sendMessage(senderId, reply);
        }
    } catch (error) {
        console.error('Erreur lors de la génération du menu:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la génération du menu.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "menu",  // Le nom de la commande
    description: "Affiche un menu avec toutes les commandes disponibles ou les détails d'une commande spécifique.",  // Description de la commande
    usage: "Envoyez 'menu' pour voir toutes les commandes ou 'menu <nom de la commande>' pour plus de détails."  // Comment utiliser la commande
};
