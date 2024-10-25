const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je recherche des images...");

        // Appeler l'API de recherche d'images
        const apiUrl = `https://recherche-photo.vercel.app/recherche?photo=${encodeURIComponent(prompt)}&page=1`;
        const response = await axios.get(apiUrl);

        // Vérifier que les images sont présentes dans la réponse
        const images = response.data.images;
        if (!images || images.length === 0) {
            await sendMessage(senderId, "Désolé, aucune image trouvée pour cette recherche.");
            return;
        }

        // Envoyer les images par groupes de 5 avec une pause de 1 seconde entre chaque groupe
        for (let i = 0; i < images.length; i += 5) {
            const batch = images.slice(i, i + 5); // Obtenir un groupe de 5 images
            for (const imageUrl of batch) {
                await sendMessage(senderId, {
                    attachment: {
                        type: "image",
                        payload: { url: imageUrl }
                    }
                });
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pause de 1 seconde
        }

        await sendMessage(senderId, "Toutes les images ont été envoyées.");
        
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de recherche d\'images:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche d'images.");
    }
};

// Informations de la commande
module.exports.info = {
    name: "photo",  // Nom de la commande
    description: "Permet d'envoyer des images basées sur une recherche.",  // Description de la commande
    usage: "Envoyez 'photo <terme>' pour obtenir des images."  // Comment utiliser la commande
};
