const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Envoyer un message d'attente avec une emoji magnifique
        await sendMessage(senderId, "✨🎶 Un instant, je recherche ton cantique... Patience s'il te plaît !");

        // Construire l'URL de l'API avec le terme fourni par l'utilisateur
        const apiUrl = `https://api-test-one-brown.vercel.app/hira?ffpm=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        
        // Récupérer le tableau des résultats depuis la réponse JSON
        const results = response.data.results;
        
        if (!results || results.length === 0) {
            await sendMessage(senderId, "🚨 Aucun cantique trouvé pour ce terme.");
            return;
        }

        // Envoyer successivement chaque résultat (titre et contenu) avec un délai d'une seconde entre chaque envoi
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const message = `✅titre : ${result.title}\n\n${result.content}`;
            await sendMessage(senderId, message);
            // Attendre 1 seconde avant d'envoyer le message suivant (sauf après le dernier)
            if (i < results.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Hita Fihirana FFPM:", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard !");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "fihirana",
    description: "Recherche et récupère des cantiques via l'API Hita Fihirana FFPM.",
    usage: "Envoyez 'fihirana <terme>' pour récupérer le cantique correspondant."
};
