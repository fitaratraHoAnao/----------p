const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Envoyer un message d'attente
        await sendMessage(senderId, "✨📜 Patiente un instant... Je recherche des proverbes pour toi ! ✨⌛");

        // Construire l'URL de l'API avec la recherche de l'utilisateur
        const apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(prompt)}&page=1`;
        const response = await axios.get(apiUrl);

        // Vérifier si des résultats sont disponibles
        if (!response.data.results || response.data.results.length === 0) {
            return await sendMessage(senderId, "❌ Aucun proverbe trouvé pour ta recherche !");
        }

        const results = response.data.results; // Liste des proverbes
        const chunkSize = 3; // Nombre de proverbes envoyés par message

        // Découper la liste des résultats en morceaux de 3 et les envoyer successivement
        for (let i = 0; i < results.length; i += chunkSize) {
            const chunk = results.slice(i, i + chunkSize).join("\n\n"); // Joindre les proverbes par saut de ligne

            // Envoyer le message avec un délai de 2 secondes entre chaque envoi
            await sendMessage(senderId, chunk);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des proverbes:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard ! 📜");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mp",  // Le nom de la commande mis à jour
    description: "Recherche des proverbes malgaches en fonction de ton mot-clé.",  
    usage: "Envoyez 'mp <mot-clé>' pour obtenir des proverbes liés à votre recherche."
};
