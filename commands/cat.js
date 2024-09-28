const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Vérifier si le texte de l'utilisateur commence par "cat"
    if (!userText.startsWith("cat")) {
        await sendMessage(senderId, 'Veuillez utiliser le format "cat <nombre>" pour demander des images de chats.');
        return;
    }

    // Extraire le nombre d'images demandé
    const args = userText.split(' ');
    const numCats = parseInt(args[1], 10); // Convertir le deuxième argument en nombre

    // Vérifier si le nombre est valide
    if (isNaN(numCats) || numCats <= 0) {
        await sendMessage(senderId, 'Veuillez fournir un nombre valide d\'images de chats.');
        return;
    }

    // Limiter le nombre maximum d'images à 10 (par exemple)
    const maxCats = Math.min(numCats, 10);

    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, `Message reçu, je prépare ${maxCats} images de chat...`);

    try {
        // Boucle pour obtenir et envoyer chaque image
        for (let i = 0; i < maxCats; i++) {
            const apiUrl = 'https://api.thecatapi.com/v1/images/search';
            const response = await axios.get(apiUrl);
            const catImageUrl = response.data[0].url; // Obtenir l'URL de l'image

            // Attendre 2 secondes avant d'envoyer l'image pour un délai naturel
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer l'image de chat à l'utilisateur
            await sendMessage(senderId, { files: [catImageUrl] });
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API The Cat API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des images de chat.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "cat",  // Le nom de la commande
    description: "Demandez des images de chat en envoyant 'cat <nombre>'.",  // Description de la commande
    usage: "Envoyez 'cat <nombre>' pour obtenir <nombre> images de chat."  // Comment utiliser la commande
};
