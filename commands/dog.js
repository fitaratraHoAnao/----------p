const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendDogImages = async (senderId, count) => {
    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, `Message reçu, je prépare ${count} images de chien...`);

    // Récupérer et envoyer les images de chien une par une avec un délai d'une seconde
    for (let i = 0; i < count; i++) {
        try {
            const apiUrl = 'https://dog.ceo/api/breeds/image/random';
            const response = await axios.get(apiUrl);
            const dogImageUrl = response.data.message; // Obtenir l'URL de l'image de chien

            // Envoyer l'image à l'utilisateur
            await sendMessage(senderId, { files: [dogImageUrl] }); // Envoi de l'image en tant que fichier

            // Attendre 1 seconde avant d'envoyer la prochaine image
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API Dog CEO:', error);
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des images de chien.');
            return; // Sortir de la fonction en cas d'erreur
        }
    }
};

module.exports = async (senderId, userText) => {
    // Vérifier si l'utilisateur a fait une demande de chiens
    const requestCount = parseInt(userText.trim(), 10); // Essayer de convertir le texte en nombre

    if (!isNaN(requestCount) && requestCount > 0) {
        // L'utilisateur a envoyé un nombre, on utilise ce nombre pour envoyer les images
        await sendDogImages(senderId, requestCount); // Appel de la fonction pour envoyer les images
        return;
    }

    // Vérifier si la commande commence par 'dog'
    if (userText.trim().toLowerCase().startsWith('dog ')) {
        // Extraire le nombre demandé
        const numDogs = parseInt(userText.slice(4).trim(), 10); // Convertir le texte en nombre

        // Vérifier si le nombre est valide
        if (isNaN(numDogs) || numDogs <= 0) {
            await sendMessage(senderId, 'Veuillez fournir un nombre valide d\'images de chiens.');
            return;
        }

        // Limiter le nombre maximum d'images à 10 (par exemple)
        const maxDogs = Math.min(numDogs, 10);

        // Envoyer toutes les images de chien
        await sendDogImages(senderId, maxDogs); // Appel de la fonction pour envoyer les images
    } else {
        await sendMessage(senderId, 'Veuillez d\'abord utiliser la commande "dog <nombre>" pour demander des images de chien ou envoyer simplement un nombre.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "dog",  // Le nom de la commande
    description: "Demandez des images de chien en envoyant 'dog <nombre>' ou simplement un nombre.",  // Description de la commande
    usage: "Envoyez 'dog <nombre>' pour obtenir ce nombre d'images de chien ou un nombre seul pour en demander davantage."  // Comment utiliser la commande
};
