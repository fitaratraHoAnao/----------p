const fs = require('fs-extra');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

// 脡tat de pagination pour chaque utilisateur
const userPaginationStates = {};

// Commande d'aide qui affiche toutes les commandes disponibles avec pagination
const helpCommand = async (senderId, args = '') => {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Initialiser l'茅tat de l'utilisateur s'il n'existe pas encore
    if (!userPaginationStates[senderId]) {
        userPaginationStates[senderId] = {
            currentPage: 1,
            itemsPerPage: 10,
            isActive: false,
            totalCommands: commandFiles.length
        };
    }

    // Analyser les arguments pour les actions de pagination
    if (args.toLowerCase() === 'next' || args === '>' || args === 'suivant') {
        userPaginationStates[senderId].currentPage++;
    } else if (args.toLowerCase() === 'prev' || args === '<' || args === 'pr茅c茅dent') {
        userPaginationStates[senderId].currentPage = Math.max(1, userPaginationStates[senderId].currentPage - 1);
    } else if (args.toLowerCase() === 'exit' || args === 'q' || args === 'quitter') {
        userPaginationStates[senderId].isActive = false;
        await sendMessage(senderId, "Vous avez quitt茅 l'aide. Tapez 'help' pour y revenir.");
        return;
    } else if (!isNaN(parseInt(args))) {
        const pageNum = parseInt(args);
        const maxPages = Math.ceil(userPaginationStates[senderId].totalCommands / userPaginationStates[senderId].itemsPerPage);
        if (pageNum >= 1 && pageNum <= maxPages) {
            userPaginationStates[senderId].currentPage = pageNum;
        } else {
            await sendMessage(senderId, `Num茅ro de page invalide. Choisissez entre 1 et ${maxPages}.`);
            return;
        }
    }

    // Activer le mode pagination
    userPaginationStates[senderId].isActive = true;

    // Calculer les limites de pagination
    const { currentPage, itemsPerPage } = userPaginationStates[senderId];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, commandFiles.length);
    const totalPages = Math.ceil(commandFiles.length / itemsPerPage);

    // Pr茅parer le message d'aide
    let helpMessage = `馃摎 Liste des commandes (${currentPage}/${totalPages}):\n\n`;

    // Ajouter les commandes 脿 la page actuelle
    for (let i = startIndex; i < endIndex; i++) {
        const commandName = commandFiles[i].replace('.js', '');
        helpMessage += `${i + 1}- ${commandName}\n`;
        try {
            const command = require(`./${commandFiles[i]}`);
            if (command.description) {
                helpMessage += `鉁� Description 馃憤: ${command.description}\n`;
            }
            if (command.usage) {
                helpMessage += `鉁� Usage 馃憤: ${command.usage}\n`;
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de la commande ${commandName}:`, error);
        }
        helpMessage += '\n';
    }

    // Ajouter les instructions de navigation
    helpMessage += `\n馃摑 Navigation:\n`;
    helpMessage += `- Tapez help + un numero pour aller 脿 cette page\n`;
    helpMessage += `- Tapez 'next' ou '>' pour la page suivante\n`;
    helpMessage += `- Tapez 'prev' ou '<' pour la page pr茅c茅dente\n`;
    helpMessage += `- Tapez 'exit' ou 'q' pour quitter l'aide\n`;

    await sendMessage(senderId, helpMessage);
};

// Exposer l'茅tat de pagination pour 锚tre utilis茅 dans handleMessage.js
helpCommand.userPaginationStates = userPaginationStates;

module.exports = helpCommand;

// Nettoyer les 茅tats de pagination inactifs toutes les heures
setInterval(() => {
    const now = Date.now();
    for (const userId in userPaginationStates) {
        // Supprimer les 茅tats inactifs depuis plus de 10 minutes
        if (now - userPaginationStates[userId].timestamp > 10 * 60 * 1000) {
            delete userPaginationStates[userId];
        }
    }
}, 60 * 60 * 1000);

// Ajouter les informations de la commande
module.exports.info = {
    name: "help",
    description: "Affiche la liste compl猫te des commandes disponibles avec pagination.",
    usage: "Envoyez 'help' pour voir les commandes par page, 'help all' pour toutes les commandes, 'help <num茅ro>' pour une page sp茅cifique."
};
