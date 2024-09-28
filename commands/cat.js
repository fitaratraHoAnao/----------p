const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendCatImages = async (senderId, count) => {
    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, `Message reçu, je prépare ${count} images de chat...`);

    // Récupérer et envoyer les images de chat une par une avec un délai d'une seconde
    for (let i = 0; i < count; i++) {
        try {
            const apiUrl = 'https://api.thecatapi.com/v1/images/search';
            const response = await axios.get(apiUrl);
            const catImageUrl = response.data[0].url; // Obtenir l'URL de l'image

            // Envoyer l'image à l'utilisateur
            await sendMessage(senderId, { files: [catImageUrl] }); // Envoi de l'image en tant que fichier

            // Attendre 1 seconde avant d'envoyer la prochaine image
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API The Cat API:', error);
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des images de chat.');
            return; // Sortir de la fonction en cas d'erreur
        }
    }
};

module.exports = async (senderId, userText) => {
    // Vérifier si l'utilisateur a fait une demande de chats
    const requestCount = parseInt(userText.trim(), 10); // Essayer de convertir le texte en nombre

    if (!isNaN(requestCount) && requestCount > 0) {
        // L'utilisateur a envoyé un nombre, on utilise ce nombre pour envoyer les images
        await sendCatImages(senderId, requestCount); // Appel de la fonction pour envoyer les images
        return;
    }

    // Vérifier si la commande commence par 'cat'
    if (userText.trim().toLowerCase().startsWith('cat ')) {
        // Extraire le nombre demandé
        const numCats = parseInt(userText.slice(4).trim(), 10); // Convertir le texte en nombre

        // Vérifier si le nombre est valide
        if (isNaN(numCats) || numCats <= 0) {
            await sendMessage(senderId, 'Veuillez fournir un nombre valide d\'images de chats.');
            return;
        }

        // Limiter le nombre maximum d'images à 10 (par exemple)
        const maxCats = Math.min(numCats, 10);

        // Envoyer toutes les images de chat
        await sendCatImages(senderId, maxCats); // Appel de la fonction pour envoyer les images
    } else {
        await sendMessage(senderId, 'Veuillez d\'abord utiliser la commande "cat <nombre>" pour demander des images de chat ou envoyer simplement un nombre.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "cat",  // Le nom de la commande
    description: "Demandez des images de chat en envoyant 'cat <nombre>' ou simplement un nombre.",  // Description de la commande
    usage: "Envoyez 'cat <nombre>' pour obtenir ce nombre d'images de chat ou un nombre seul pour en demander davantage."  // Comment utiliser la commande
};
