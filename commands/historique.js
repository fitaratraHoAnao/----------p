const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom de la personne en retirant le préfixe 'historique' et en supprimant les espaces superflus
    const person = userText.slice(10).trim(); // 10 caractères pour 'historique '

    // Vérifier si le nom est vide
    if (!person) {
        await sendMessage(senderId, 'Veuillez fournir un nom de personne pour obtenir des informations historiques.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API Wikipedia avec le nom fourni
        const apiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(person)}`;
        const response = await axios.get(apiUrl);

        // Récupérer les informations pertinentes de l'API
        const { title, extract, thumbnail, content_urls } = response.data;

        // Vérifier si la réponse contient un extrait
        if (!extract) {
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu trouver d\'informations sur cette personne.');
            return;
        }

        // Construire le message de réponse avec les informations
        let reply = `**${title}**\n\n${extract}\n\n[En savoir plus ici](${content_urls.desktop.page})`;

        // Ajouter une image si disponible
        if (thumbnail && thumbnail.source) {
            reply += `\n![Image](${thumbnail.source})`;
        }

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Wikipedia :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        if (error.response) {
            // Erreur de réponse de l'API
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande. (Erreur: ' + error.response.status + ')');
        } else if (error.request) {
            // Erreur de requête
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu atteindre le service. Vérifiez votre connexion Internet.');
        } else {
            // Autres erreurs
            await sendMessage(senderId, 'Une erreur inconnue s\'est produite. Veuillez réessayer.');
        }
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "historique",  // Le nom de la commande
    description: "Obtenez des informations historiques sur une personne.",  // Description de la commande
    usage: "Envoyez 'historique <nom>' pour obtenir des informations."  // Comment utiliser la commande
};
