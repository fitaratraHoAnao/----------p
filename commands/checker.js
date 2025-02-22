const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Envoyer un message d'attente magnifique avec des emojis
        await sendMessage(senderId, "✨✍️ Un instant... Je vérifie l'orthographe et la grammaire de ton texte ! 🔍📖");

        // Construire l'URL de l'API pour vérifier l'orthographe
        const apiUrl = `https://check-ortho-francais.vercel.app/check`;
        const response = await axios.post(apiUrl, {
            text: prompt,
            language: "fr"
        });

        // Récupérer la réponse de l'API
        const corrections = response.data.corrections;

        // Construire le message de réponse
        let reply = "🔎 Voici les corrections proposées :\n\n";
        if (corrections.length === 0) {
            reply += "✅ Aucune faute détectée ! Ton texte est parfait. 🎉";
        } else {
            corrections.forEach((correction, index) => {
                reply += `📌 *${correction.message}*\n👉 Suggestions : ${correction.suggestions.join(", ")}\n\n`;
            });
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API de correction orthographique :", error);

        // Envoyer un message d'erreur à l'utilisateur
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors de la vérification orthographique. Réessaie plus tard ! ✍️");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "checker",  // Le nom de la commande
    description: "Vérifie l'orthographe et la grammaire de ton texte en français.",  // Description de la commande
    usage: "Envoyez 'checker <ton texte>' pour obtenir une correction orthographique."  // Comment utiliser la commande
};
