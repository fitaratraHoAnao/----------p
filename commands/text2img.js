const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je génère une image...");

        // Construire l'URL de l'API pour générer une image
        const query = encodeURIComponent(prompt);
        const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${query}`;

        // Envoyer un message de confirmation de génération d'image
        await sendMessage(senderId, "Génération en cours... Veuillez patienter.");

        // Appeler l'API de génération d'image
        const response = await axios.get(apiUrl);

        // Récupérer l'URL de l'image de la réponse de l'API
        const imageUrl = response.data.image_url;

        // Vérifier si une image a été générée
        if (imageUrl) {
            // Envoyer l'image à l'utilisateur
            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: imageUrl,
                        is_reusable: true
                    }
                }
            });

            // Envoyer un message de confirmation finale
            await sendMessage(senderId, "L'image a été générée avec succès !");
        } else {
            // Si aucune image n'est retournée, informer l'utilisateur
            await sendMessage(senderId, "Désolé, je n'ai pas pu générer d'image pour cette demande.");
        }
    } catch (error) {
        console.error("Erreur lors de la génération de l'image:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "text2img",  // Le nom de la commande
    description: "Génère et envoie une image basée sur le texte saisi.",  // Description de la commande
    usage: "Envoyez 'text2img <description>' pour générer une image."  // Comment utiliser la commande
};
