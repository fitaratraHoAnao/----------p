const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, prompt) => { 
    try {
        // Envoyer un message d'attente
        await sendMessage(senderId, "✨ Génération de l'image en cours... ⏳");

        // Vérifier si le prompt est vide et lui assigner une valeur par défaut si nécessaire
        if (!prompt || prompt.trim() === '') {
            prompt = 'fille'; // Valeur par défaut
        }

        // Construire l'URL de l'API pour générer l'image
        const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${encodeURIComponent(prompt)}`;

        console.log(`Appel API avec l'URL: ${apiUrl}`);

        // Envoyer directement l'image en réponse
        await sendMessage(senderId, { 
            attachment: { 
                type: "image", 
                payload: { 
                    url: apiUrl,
                    is_reusable: true
                } 
            } 
        });

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de génération d\'image:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "🚨 Oups ! Une erreur s'est produite lors de la génération de l'image.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "generation",  // Nom de la commande
    description: "Génère une image à partir d'un texte avec l'API Kaiz.",  // Description
    usage: "Envoyez 'generation <description>' pour obtenir une image."  // Comment utiliser la commande
};
