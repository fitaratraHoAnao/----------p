const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    const [menuCmd, commandName] = prompt.split(' ').map(str => str.trim()); // Extraire le nom de la commande (si spécifié)
    const page = parseInt(menuCmd.replace('menu', '').trim()) || 1; // Obtenir le numéro de page (default à 1)
    const commandsPerPage = 10; // Nombre maximal de commandes par page

    try {
        // Lire les fichiers dans le répertoire "commands"
        const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));

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

            // Calculer le nombre de pages
            const totalCommands = commandsInfo.length;
            const totalPages = Math.ceil(totalCommands / commandsPerPage);
            const startIndex = (page - 1) * commandsPerPage;
            const endIndex = Math.min(startIndex + commandsPerPage, totalCommands);
            const paginatedCommands = commandsInfo.slice(startIndex, endIndex);

            // Formater le menu pour la page actuelle
            const formattedMenu = paginatedCommands
                .map((cmd, index) => `│ ${startIndex + index + 1}. ${cmd.name} - ${cmd.description}\n   Usage: ${cmd.usage}`)
                .join('\n\n');

            const reply = `
╭─────────────⭓
│ 🇲🇬 Menus disponibles 🇲🇬:
│ 
${formattedMenu}
├─────⭔
│ Page [ ${page}/${totalPages} ]
│ Actuellement, le bot a ${totalCommands} commandes qui peuvent être utilisées
│ » Tapez 'menu <numéro>' pour voir la page correspondante
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
    description: "Affiche un menu avec toutes les commandes disponibles.", // Description de la commande
    usage: "menu [numéro|nom]", // Exemple d'utilisation
};
