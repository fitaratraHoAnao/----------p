const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Déterminer s'il s'agit d'une requête pour des images
        const query = encodeURIComponent(prompt);
        const apiUrl = `https://ronald-api-v1.vercel.app/api/pinterest?text=${query}`;

        // Envoyer un message de confirmation de recherche
        await sendMessage(senderId, "Recherche en cours sur Pinterest... Je vais vous envoyer les images.");

        // Appeler l'API de recherche d'images Pinterest
        const response = await axios.get(apiUrl);

        // Récupérer les images de la réponse de l'API
        const images = response.data.result;

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
            await sendMessage(senderId, "Toutes les images Pinterest ont été envoyées.");
        } else {
            // Si aucune image n'est trouvée, informer l'utilisateur
            await sendMessage(senderId, "Aucune image Pinterest trouvée pour votre recherche.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des images Pinterest:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande Pinterest.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "pinterest",  // Le nom de la commande
    description: "Recherche et envoie des images Pinterest basées sur le texte saisi.",  // Description de la commande
    usage: "Envoyez 'pinterest <recherche>' pour trouver des images sur Pinterest."  // Comment utiliser la commande
};
