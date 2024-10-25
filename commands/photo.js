const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendPhotoImages = async (senderId, count) => {
    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, `Message reçu, je prépare ${count} images en lien avec votre recherche...`);

    try {
        // Appel de l'API pour obtenir les images
        const apiUrl = 'https://recherche-photo.vercel.app/recherche?photo=carte%20de%20Madagascar&page=1';
        const response = await axios.get(apiUrl);
        const images = response.data.images; // Liste des URLs d'images

        // Envoyer les images par lots de 5 avec un délai d'une seconde entre chaque envoi
        for (let i = 0; i < count; i += 5) {
            const batch = images.slice(i, i + 5); // Prendre 5 images à la fois

            // Envoyer les images du lot à l'utilisateur
            await sendMessage(senderId, { files: batch });

            // Attendre 1 seconde avant d'envoyer le prochain lot
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API des images:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des images.");
    }
};

module.exports = async (senderId, userText) => {
    // Vérifier si l'utilisateur a envoyé un nombre pour demander des images
    const requestCount = parseInt(userText.trim(), 10);

    if (!isNaN(requestCount) && requestCount > 0) {
        // Appel de la fonction pour envoyer les images
        await sendPhotoImages(senderId, requestCount);
        return;
    }

    // Vérifier si la commande commence par 'photo'
    if (userText.trim().toLowerCase().startsWith('photo ')) {
        const numPhotos = parseInt(userText.slice(6).trim(), 10);

        // Valider le nombre d'images
        if (isNaN(numPhotos) || numPhotos <= 0) {
            await sendMessage(senderId, "Veuillez fournir un nombre valide d'images.");
            return;
        }

        // Limiter le nombre maximum d'images à 15 (par exemple)
        const maxPhotos = Math.min(numPhotos, 15);

        // Envoyer toutes les images demandées
        await sendPhotoImages(senderId, maxPhotos);
    } else {
        await sendMessage(senderId, 'Utilisez la commande "photo <nombre>" pour demander des images ou envoyez simplement un nombre.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "photo",
    description: "Demandez des images en envoyant 'photo <nombre>' ou simplement un nombre.",
    usage: "Envoyez 'photo <nombre>' pour obtenir ce nombre d'images ou un nombre seul pour en demander davantage."
};
