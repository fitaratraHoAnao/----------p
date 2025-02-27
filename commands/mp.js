const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker l'état des pages pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Initialiser la session utilisateur si elle n'existe pas
        if (!userSessions[senderId]) {
            userSessions[senderId] = { prompt, page: 1 };
        }

        // Récupérer la page actuelle
        const { prompt: storedPrompt, page } = userSessions[senderId];

        // Envoyer un message d'attente
        await sendMessage(senderId, `✨📜 Recherche des proverbes pour : "${storedPrompt}" (Page ${page})... ⌛`);

        // Construire l'URL de l'API avec la recherche et la page actuelle
        const apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(storedPrompt)}&page=${page}`;
        const response = await axios.get(apiUrl);

        // Vérifier si des résultats sont disponibles
        if (!response.data.results || response.data.results.length === 0) {
            await sendMessage(senderId, `❌ Aucun proverbe trouvé pour la page ${page} !`);
            return;
        }

        const results = response.data.results; // Liste des proverbes
        const chunkSize = 3; // Nombre de proverbes envoyés par message

        // Découper la liste des résultats en morceaux de 3 et les envoyer successivement
        for (let i = 0; i < results.length; i += chunkSize) {
            const chunk = results.slice(i, i + chunkSize).map((proverb, index) => `${i + index + 1}. ${proverb}`).join("\n\n");

            // Envoyer le message avec un délai de 2 secondes entre chaque envoi
            await sendMessage(senderId, chunk);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Demander à l'utilisateur s'il veut voir une autre page
        await sendMessage(senderId, `📜 Tape un numéro (ex: ${page + 1}) pour voir la page suivante.`);

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des proverbes:", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue. Réessaie plus tard ! 📜");
    }
};

// Gérer la demande de pages suivantes
module.exports.handleMessage = async (senderId, message) => {
    if (userSessions[senderId] && !isNaN(message)) {
        const newPage = parseInt(message);

        // Vérifier que l'utilisateur ne tape pas une page négative
        if (newPage < 1) {
            await sendMessage(senderId, "❌ Numéro de page invalide !");
            return;
        }

        userSessions[senderId].page = newPage; // Mettre à jour la page
        await module.exports(senderId, userSessions[senderId].prompt);
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mp",
    description: "Recherche des proverbes malgaches en fonction de ton mot-clé.",  
    usage: "Envoyez 'mp <mot-clé>' pour obtenir des proverbes liés à votre recherche. Tape un numéro (ex: 2) pour voir la page suivante."
};
