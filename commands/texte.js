const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, page) => {
    try {
        // Appeler l'API pour obtenir les articles et images
        const apiUrl = `https://texte-francais.vercel.app/affiche?page=${encodeURIComponent(page)}`;
        const response = await axios.get(apiUrl);

        // Récupérer les articles de la réponse de l'API
        const articles = response.data.articles;

        // Vérifier si des articles sont retournés
        if (articles && articles.length > 0) {
            // Boucler sur chaque article et envoyer le texte avec l'image associée
            for (let i = 0; i < articles.length; i++) {
                const { article_text, image_url } = articles[i];

                // Envoyer le texte de l'article
                await sendMessage(senderId, article_text);

                // Envoyer l'image associée en pièce jointe
                if (image_url) {
                    await sendMessage(senderId, {
                        attachment: {
                            type: 'image',
                            payload: {
                                url: image_url,
                                is_reusable: true
                            }
                        }
                    });
                }

                // Attendre une seconde entre chaque envoi d'article et d'image
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            // Si aucun article n'est trouvé, envoyer un message à l'utilisateur
            await sendMessage(senderId, "Aucun article trouvé pour cette page.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API pour récupérer les articles:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des articles.");
    }
};

// Informations de la commande
module.exports.info = {
    name: "texte",
    description: "Envoie chaque article avec son image en pièce jointe pour un numéro de page spécifique.",
    usage: "Envoyez 'texte <numéro de page>' pour recevoir les articles et images correspondants."
};
