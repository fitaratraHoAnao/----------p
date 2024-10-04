const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, message) => {
    try {
        // Envoyer un message de demande d'image
        await sendMessage(senderId, "Envoyez-moi une image pour extraire le texte.");

        // Vérifier si le message contient une image (ajouter votre logique pour récupérer l'image)
        if (message.attachments && message.attachments.length > 0) {
            const imageUrl = message.attachments[0].url; // Assurez-vous que l'URL de l'image est correcte

            // Envoyer un message de confirmation que l'image a été reçue
            await sendMessage(senderId, "Je vais extraire le texte de cette image que vous avez envoyée...");

            // Appeler l'API pour extraire le texte
            const apiUrl = `https://mon-image-to-txt.onrender.com/img2txt?image_url=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(apiUrl);

            // Récupérer le texte extrait
            const extractedText = response.data.réponse;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer le texte extrait à l'utilisateur
            await sendMessage(senderId, extractedText);
        } else {
            // Si aucune image n'est attachée, envoyer un message d'erreur
            await sendMessage(senderId, "Aucune image trouvée. Veuillez envoyer une image.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API ou du traitement de l\'image:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre image.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "img",  // Le nom de la commande
    description: "Envoyez une image pour extraire le texte.",  // Description de la commande
    usage: "Envoyez 'img' suivi de l'image pour extraire le texte de celle-ci."  // Comment utiliser la commande
};
