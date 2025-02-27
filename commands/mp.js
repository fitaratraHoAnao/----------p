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

        const { prompt: storedPrompt, page } = userSessions[senderId];

        // Envoyer un message d'attente
        await sendMessage(senderId, `✨📜 Recherche des proverbes pour : "${storedPrompt}" (Page ${page})... ⌛`);

        // Construire l'URL de l'API avec la recherche et la page actuelle
        const apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(storedPrompt)}&page=${page}`;
        const response = await axios.get(apiUrl);

        // Vérifier si des résultats sont disponibles
        if (!response.data.results || response.data.results.length === 0) {
            return await sendMessage(senderId, "❌ Aucun proverbe trouvé pour cette page !");
        }

        const results = response.data.results; // Liste des proverbes
        const chunkSize = 15; // Nombre de proverbes envoyés par message

        // Découper la liste des résultats en morceaux de 3 et les envoyer successivement
        for (let i = 0; i < results.length; i += chunkSize) {
            const chunk = results.slice(i, i + chunkSize).map((proverb, index) => `${i + index + 1}. ${proverb}`).join("\n\n");

            // Envoyer le message avec un délai de 2 secondes entre chaque envoi
            await sendMessage(senderId, chunk);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Vérifier s'il y a une page suivante
        if (response.data.nextPage) {
            await sendMessage(senderId, `📜 Pour voir la page suivante, envoie un numéro (ex: ${page + 1}).`);
        } else {
            await sendMessage(senderId, "📌 Fin des résultats. Recommence avec un autre mot-clé si besoin.");
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des proverbes:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard ! 📜");
    }
};

// Gérer la demande de pages suivantes
module.exports.handleMessage = async (senderId, message) => {
    if (userSessions[senderId] && !isNaN(message)) {
        userSessions[senderId].page = parseInt(message);
        await module.exports(senderId, userSessions[senderId].prompt);
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mp",  // Le nom de la commande mis à jour
    description: "Recherche des proverbes malgaches en fonction de ton mot-clé.",  
    usage: "Envoyez 'mp <mot-clé>' pour obtenir des proverbes liés à votre recherche. Tape un numéro (ex: 2) pour voir la page suivante."
};
        
