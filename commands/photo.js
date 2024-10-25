const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Déterminer s'il s'agit d'une requête pour des images
        const query = encodeURIComponent(prompt);
        const apiUrl = `https://recherche-photo.vercel.app/recherche?photo=${query}&page=1`;

        // Envoyer un message de confirmation de recherche
        await sendMessage(senderId, "Recherche en cours... Je vais vous envoyer les images.");

        // Appeler l'API de recherche d'images
        const response = await axios.get(apiUrl);

        // Récupérer les images de la réponse de l'API
        const images = response.data.images;

        // Vérifier si des images sont retournées
        if (images && images.length > 0) {
            // Boucler sur chaque image avec un intervalle d'une seconde entre chaque envoi
            for (let i = 0; i < images.length; i++) {
                const imageUrl = images[i];

                // Envoyer un message avec l'image
                await sendMessage(senderId, {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: imageUrl,
                            is_reusable: true
                        }
                    }
                });

                // Attendre une seconde avant d'envoyer la prochaine image
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Envoyer un message final une fois toutes les images envoyées
            await sendMessage(senderId, "Toutes les images ont été envoyées.");
        } else {
            // Si aucune image n'est trouvée, informer l'utilisateur
            await sendMessage(senderId, "Aucune image trouvée pour votre recherche.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des images:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "photo",  // Le nom de la commande
    description: "Recherche et envoie des images basées sur le texte saisi.",  // Description de la commande
    usage: "Envoyez 'photo <recherche>' pour rechercher des images."  // Comment utiliser la commande
};
