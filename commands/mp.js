const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => { 
    try {
        // Vérifier si un numéro de page est inclus dans le message
        const parts = prompt.trim().split(/\s+/); 
        const searchQuery = parts.slice(0, -1).join(" "); // Tout sauf le dernier élément
        let page = parseInt(parts[parts.length - 1]); // Dernier élément = numéro de page potentiel

        if (isNaN(page)) {
            page = 1; // Si aucun numéro de page n'est fourni, utiliser la page 1
        }

        // Envoyer un message d'attente
        await sendMessage(senderId, `✨📜 Recherche des proverbes pour : "${searchQuery}" (Page ${page})... ⌛`);

        // Construire l'URL de l'API avec la recherche et la page actuelle
        const apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(searchQuery)}&page=${page}`;
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

    
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des proverbes:", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue. Réessaie plus tard ! 📜");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mp",
    description: "Recherche des proverbes malgaches en fonction de ton mot-clé.",
    usage: "Envoyez 'mp <mot-clé>' pour obtenir des proverbes liés à votre recherche. Ajoutez un numéro pour voir une page spécifique : 'mp <mot-clé> <page>'."
};
