const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les mots-clés et pages pour chaque utilisateur
let userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si le prompt est un mot ou un numéro de page
        if (isNaN(prompt)) {
            // Si c'est un mot (nouvelle recherche)
            userSessions[senderId] = {
                keyword: prompt, // Mot recherché
                page: 1 // Page par défaut
            };
        } else {
            // Si c'est un numéro de page, vérifier si une recherche est en cours
            if (userSessions[senderId] && userSessions[senderId].keyword) {
                // Mettre à jour la page
                userSessions[senderId].page = parseInt(prompt);
            } else {
                // Si aucun mot n'est défini, renvoyer un message d'erreur
                await sendMessage(senderId, "Veuillez d'abord faire une recherche en envoyant 'ohabolana <mot>'.");
                return;
            }
        }

        // Extraire le mot-clé et la page actuelle de la session utilisateur
        const keyword = userSessions[senderId].keyword;
        const page = userSessions[senderId].page;

        // Envoyer un message de confirmation
        await sendMessage(senderId, `Recherche d'ohabolana pour '${keyword}', page ${page}...`);

        // Appeler l'API avec le mot-clé et la page
        const apiUrl = `https://ohabolana-lac.vercel.app/ohabolana?fanontaniana=${encodeURIComponent(keyword)}&page=${page}`;
        const response = await axios.get(apiUrl);

        // Récupérer les données JSON des ohabolana
        const ohabolanaList = response.data;

        // Vérifier si la liste est vide
        if (ohabolanaList.length === 0) {
            await sendMessage(senderId, `Aucun résultat trouvé pour '${keyword}' à la page ${page}.`);
            return;
        }

        // Construire la réponse à envoyer à l'utilisateur
        let reply = `Ohabolana - Page ${page}:\n\n`;
        ohabolanaList.forEach(ohabolana => {
            reply += `${ohabolana.number} ${ohabolana.text} - ${ohabolana.author}\n\n`;
        });

        // Envoyer la réponse à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Ohabolana:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "ohabolana",  // Nom de la commande
    description: "Permet de rechercher des ohabolana malagasy avec pagination.",  // Description
    usage: "Envoyez 'ohabolana <mot>' pour chercher des ohabolana par mot-clé, puis envoyez un numéro pour naviguer dans les pages."  // Comment utiliser la commande
};
