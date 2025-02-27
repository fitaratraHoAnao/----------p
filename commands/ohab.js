const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importation de sendMessage

module.exports = async (senderId, prompt, uid) => {
    try {
        // Envoyer un message d'attente
        await sendMessage(senderId, "🔎 Recherche en cours... Patiente un instant ! ⏳");

        let apiUrl;
        let page = 1;
        
        // Vérifier si l'utilisateur a envoyé un nombre (demande de page)
        if (!isNaN(prompt)) {
            page = parseInt(prompt, 10);
            apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(uid)}&page=${page}`;
        } else {
            apiUrl = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(prompt)}&page=1`;
        }

        const response = await axios.get(apiUrl);
        const data = response.data;

        // Vérifier si des résultats existent
        if (!data.results || data.results.length === 0) {
            await sendMessage(senderId, "❌ Aucun ohabolana trouvé pour ta recherche.");
            return;
        }

        // Stocker le mot recherché pour la pagination
        if (isNaN(prompt)) {
            uid = prompt;
        }

        // Envoyer les résultats par lots de 10
        for (let i = 0; i < data.results.length; i += 10) {
            const batch = data.results.slice(i, i + 10).join("\n\n");
            await sendMessage(senderId, batch);
        }

        // Informer sur la pagination si une autre page existe
        if (data.nextPage !== null) {
            await sendMessage(senderId, `📜 Pour voir plus d'ohabolana, envoie "${page + 1}"`);
        }
    } catch (error) {
        console.error("Erreur lors de la requête API :", error);
        await sendMessage(senderId, "🚨 Une erreur s'est produite. Réessaie plus tard !");
    }
};

// Informations de la commande
module.exports.info = {
    name: "ohab",  // Nouveau nom de la commande
    description: "Recherche des ohabolana malgaches par mot-clé.",  
    usage: "Envoyez 'ohab <mot>' pour rechercher des ohabolana, ou un nombre pour afficher la page suivante."
};
