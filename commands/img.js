const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API Flask
const BASE_API_URL = 'https://mon-image-to-txt.onrender.com/img2txt';

module.exports = async (senderId, message) => {
    // Vérifier si le message contient une pièce jointe de type image
    if (message.attachments && message.attachments.length > 0) {
        const attachment = message.attachments[0];

        // Vérifier que l'attachement est bien de type 'image'
        if (attachment.type === 'image') {
            const imageUrl = attachment.payload.url;

            // Envoyer un message de confirmation que l'image a été reçue
            await sendMessage(senderId, "Image reçue, je prépare une réponse...");

            try {
                // Appeler l'API Flask img2txt avec l'URL de l'image
                const apiUrl = BASE_API_URL;
                const response = await axios.post(apiUrl, {
                    image_url: imageUrl
                });

                // Récupérer la réponse de l'API Flask
                const extractedText = response.data.extracted_text;

                // Envoyer le texte extrait à l'utilisateur
                if (extractedText) {
                    await sendMessage(senderId, `Voici le texte extrait de l'image : \n${extractedText}`);
                } else {
                    await sendMessage(senderId, "Désolé, je n'ai pas pu extraire de texte de cette image.");
                }
            } catch (error) {
                console.error('Erreur lors de l\'appel à l\'API img2txt:', error);
                await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de l'image.");
            }
        } else {
            // Si le type de la pièce jointe n'est pas une image
            await sendMessage(senderId, "Veuillez envoyer une image pour que je puisse extraire le texte.");
        }
    } else {
        // Si aucune pièce jointe n'est envoyée
        await sendMessage(senderId, "Veuillez envoyer une image pour que je puisse extraire le texte.");
    }
};
// Ajouter les informations de la commande
module.exports.info = {
    name: "img",  // Le nom de la commande
    description: "Envoyer une image pour obtenir le texte extrait.",  // Description de la commande
    usage: "Envoyez une image pour obtenir le texte extrait."  // Comment utiliser la commande
};
