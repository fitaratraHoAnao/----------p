const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args) => {
    const searchQuery = args.join(" ");

    // Vérifier si l'utilisateur a fourni une requête de recherche
    if (!searchQuery) {
        return sendMessage(senderId, "Veuillez fournir une requête de recherche (par exemple, histoire de la guerre anglo-népalaise).");
    }

    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Recherche en cours, veuillez patienter...");

        // Appeler l'API Wikipedia pour récupérer les informations historiques
        const response = await axios.get(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`);

        // Vérifier la réponse de l'API
        if (response.data.title && response.data.extract) {
            const title = response.data.title;
            const extract = response.data.extract;
            await sendMessage(senderId, `Informations sur "${title}" :\n${extract}`);
        } else {
            await sendMessage(senderId, `Aucune information trouvée pour "${searchQuery}".`);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des informations historiques :", error);
        await sendMessage(senderId, "Une erreur est survenue lors de la récupération des informations historiques.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "historique",  // Le nom de la commande
    description: "Fournit des informations historiques à partir de Wikipedia.",  // Description de la commande
    usage: "Envoyez 'historique <terme>' pour obtenir des informations historiques."  // Comment utiliser la commande
};
