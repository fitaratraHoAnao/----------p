const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, `Attendez, je conjugue le verbe "${prompt}"...`);

        // Utiliser le prompt comme verbe pour l'API de conjugaison
        const apiUrl = `https://conjugaison-livid.vercel.app/conjugaison?verbe=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Formatage de la réponse
        const conjugaison = response.data; // Récupérer la réponse JSON
        let formattedReply = '';

        // Créer un format lisible à partir de la réponse
        for (const [tense, forms] of Object.entries(conjugaison)) {
            formattedReply += `👉${tense.charAt(0).toUpperCase() + tense.slice(1)} :\n`;
            formattedReply += forms.map(form => `    ${form}`).join('\n') + '\n\n'; // Ajouter les formes avec indentation
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, formattedReply.trim());
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de conjugaison:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "conjugaison",  // Le nom de la commande modifié
    description: "Permet de conjuguer des verbes.",  // Description de la commande modifiée
    usage: "Envoyez 'conjugaison <verbe>' pour obtenir la conjugaison du verbe."  // Comment utiliser la commande modifiée
};
