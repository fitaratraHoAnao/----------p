const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API d'extraction d'image
const OCR_API_URL = 'https://mon-image-to-txt.onrender.com/img2txt';

module.exports = async (senderId, message) => {
    let imageUrl;

    // Vérifier si le message contient une image attachée (via Messenger)
    if (message.attachments && message.attachments[0].type === 'image') {
        imageUrl = message.attachments[0].payload.url;
    } else {
        // Vérifier si le message contient un lien vers une image
        const userInput = message.text || '';
        const isImageUrl = userInput.toLowerCase().includes('.jpg') || userInput.toLowerCase().includes('.jpeg') || userInput.toLowerCase().includes('.png');
        
        if (!isImageUrl) {
            await sendMessage(senderId, 'Veuillez envoyer une image (jpg, jpeg, png) pour extraire le texte.');
            return;
        }

        // Si l'utilisateur a envoyé un lien d'image
        imageUrl = userInput.trim();
    }

    // Si l'URL de l'image est disponible, continuer avec le traitement
    if (imageUrl) {
        try {
            // Envoyer un message de confirmation que la requête est en cours de traitement
            await sendMessage(senderId, "Merci pour l'image, je vais en extraire le texte...");

            // Appel à l'API OCR avec l'URL de l'image
            const ocrResponse = await axios.post(OCR_API_URL, {
                image_url: imageUrl
            });

            // Récupérer le texte extrait de la réponse de l'API
            const extractedText = ocrResponse.data.ParsedResults[0].ParsedText;

            // Attendre 1 seconde avant d'envoyer la réponse pour un effet plus naturel
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Envoyer le texte extrait à l'utilisateur
            if (extractedText) {
                await sendMessage(senderId, `Voici le texte extrait de l'image : \n${extractedText}`);
            } else {
                await sendMessage(senderId, 'Désolé, aucun texte n\'a pu être extrait de l\'image.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API d\'OCR:', error);

            // Envoyer un message d'erreur à l'utilisateur en cas de problème
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de l\'extraction du texte de l\'image.');
        }
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "img",  // Le nom de la commande
    description: "Envoyez une image ou un lien d'image pour en extraire le texte.",  // Description de la commande
    usage: "Envoyez une image jpg, jpeg ou png pour que le bot en extraie le texte."  // Comment utiliser la commande
};
