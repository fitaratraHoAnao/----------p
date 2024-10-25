const axios = require('axios');
const sendMessage = require('../sendMessage');

module.exports = async (senderId, prompt) => {
    const searchQuery = encodeURIComponent(prompt);
    const apiUrl = `https://recherche-photo.vercel.app/recherche?photo=${searchQuery}&page=1`;

    try {
        // Appeler l'API pour obtenir les images
        const response = await axios.get(apiUrl);
        console.log('Réponse de l\'API:', response.data);

        // Récupérer les URLs des images dans la réponse de l'API
        const images = response.data.images;

        console.log('Images récupérées:', images);

        // Si aucune image trouvée, informer l'utilisateur
        if (images.length === 0) {
            await sendMessage(senderId, "Désolé, aucune image trouvée.");
            return;
        }

        // Envoyer chaque image avec un délai
        for (const imageUrl of images) {
            console.log('Envoi de l\'image:', imageUrl);  // Log pour vérifier les URLs

            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: imageUrl,
                    },
                },
            });

            // Délai de 1 seconde
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await sendMessage(senderId, "Toutes les images ont été envoyées.");
    } catch (error) {
        console.error('Erreur lors de la recherche de photos :', error.response ? error.response.data : error.message);
        await sendMessage(senderId, "Une erreur s'est produite lors de la recherche de photos.");
    }
};
