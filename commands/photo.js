const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendImagesAsAttachments = async (senderId, count) => {
    // Message de confirmation
    await sendMessage(senderId, `Message reçu, je prépare ${count} images en lien avec votre recherche...`);

    // URL de l'API pour obtenir les images
    const apiUrl = 'https://recherche-photo.vercel.app/recherche?photo=carte%20de%20Madagascar&page=1';

    try {
        const response = await axios.get(apiUrl);
        const imageUrls = response.data.images.slice(0, count); // Limiter au nombre demandé

        for (const imageUrl of imageUrls) {
            const imageFileName = path.basename(imageUrl); // Nom du fichier image
            const imagePath = path.resolve(__dirname, 'temp', imageFileName);

            // Télécharger l'image et sauvegarder dans le dossier temporaire
            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const writer = imageResponse.data.pipe(fs.createWriteStream(imagePath));

            // Attendre la fin du téléchargement
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Envoyer l'image en tant qu'attachement
            await sendMessage(senderId, { files: [imagePath] });

            // Supprimer l'image téléchargée après l'envoi
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Erreur lors de la suppression de l\'image temporaire:', err);
            });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des images.');
    }
};

module.exports = async (senderId, userText) => {
    const requestCount = parseInt(userText.trim(), 10); // Extraire le nombre d'images demandé

    if (!isNaN(requestCount) && requestCount > 0) {
        await sendImagesAsAttachments(senderId, requestCount);
    } else {
        await sendMessage(senderId, 'Veuillez envoyer "photo <nombre>" pour obtenir des images.');
    }
};

// Informations de la commande
module.exports.info = {
    name: "photo",
    description: "Demandez des images de la carte de Madagascar en envoyant 'photo <nombre>'.",
    usage: "Envoyez 'photo <nombre>' pour obtenir ce nombre d'images."
};
