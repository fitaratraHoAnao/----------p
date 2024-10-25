const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Recherche en cours... Je vais vous envoyer les images.");

        // Appeler l'API pour obtenir les images en fonction du prompt (ici la recherche d'images)
        const apiUrl = `https://recherche-photo.vercel.app/recherche?photo=${encodeURIComponent(prompt)}&page=1`;
        const response = await axios.get(apiUrl);

        // Récupérer les URLs des images dans la réponse de l'API
        const images = response.data.images;

        // Vérifier si des images ont été trouvées
        if (images.length === 0) {
            await sendMessage(senderId, "Désolé, aucune image trouvée.");
            return;
        }

        // Envoyer chaque image à l'utilisateur avec un délai de 1 seconde entre chaque
        for (const imageUrl of images) {
            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: imageUrl,
                    },
                },
            });

            // Attendre 1 seconde avant d'envoyer l'image suivante
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Indiquer à l'utilisateur que toutes les images ont été envoyées
        await sendMessage(senderId, "Toutes les images ont été envoyées.");
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API photo:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des images.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "photo",  // Le nom de la commande
    description: "Recherche et envoie des images basées sur votre recherche.",  // Description de la commande
    usage: "Envoyez 'photo <mot-clé>' pour rechercher et recevoir des images."  // Comment utiliser la commande
};
