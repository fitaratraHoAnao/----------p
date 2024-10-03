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
        const imageUrl = response.data; // Supposons que l'URL de l'image est renvoyée directement

        // Envoyer l'image à l'utilisateur
        await sendMessage(senderId, { files: [imageUrl] }); // Envoi de l'image en tant que fichier
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
