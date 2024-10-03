const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendImageFromPrompt = async (senderId, prompt) => {
    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, `Message reçu, je prépare votre image...`);

    try {
        // Construire l'URL de l'API avec le prompt
        const apiUrl = `https://team-calyx.onrender.com/gen?prompt=${encodeURIComponent(prompt)}`;
        
        // Appeler l'API pour générer l'image
        const response = await axios.get(apiUrl);
        console.log('Réponse de l\'API:', response.data); // Afficher la réponse de l'API

        // Vérifier si la réponse contient une URL d'image
        if (response.data && response.data.image_url) { // Modifiez cette ligne selon la structure de votre réponse
            const imageUrl = response.data.image_url;

            // Envoyer l'image à l'utilisateur
            await sendMessage(senderId, { files: [imageUrl] }); // Envoi de l'image en tant que fichier
        } else {
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu trouver l\'image.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de génération d\'images:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la génération de l\'image.');
    }
};

module.exports = async (senderId, userText) => {
    // Vérifier si l'utilisateur a fourni un prompt
    const prompt = userText.trim();

    if (prompt) {
        // Envoyer l'image à partir du prompt
        await sendImageFromPrompt(senderId, prompt);
        return;
    }

    await sendMessage(senderId, 'Veuillez fournir un prompt pour générer une image.');
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "image",  // Le nom de la commande
    description: "Demandez une image en envoyant un prompt.",  // Description de la commande
    usage: "Envoyez simplement un texte pour obtenir une image."  // Comment utiliser la commande
};
