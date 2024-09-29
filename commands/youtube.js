const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, query) => {
    try {
        // Vérification de la validité de la requête
        if (!query || typeof query !== 'string' || query.trim() === '') {
            await sendMessage(senderId, "Veuillez entrer une requête valide pour rechercher une vidéo sur YouTube.");
            return;
        }

        // Envoyer un message de confirmation que la recherche est en cours
        await sendMessage(senderId, "Recherche en cours, veuillez patienter...");

        // Appeler l'API YouTube pour rechercher des vidéos par titre
        const apiUrlSearch = `https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(query)}`;
        
        const response = await axios.get(apiUrlSearch);

        // Récupérer les résultats de la recherche
        const items = response.data.result?.items;

        if (!items || items.length === 0) {
            await sendMessage(senderId, "Aucune vidéo trouvée pour votre recherche.");
            return;
        }

        // Formater les résultats pour l'envoi
        const results = items.map(item => {
            const videoTitle = item.snippet.title;
            const videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
            return `${videoTitle}: ${videoUrl}`;
        }).join('\n');

        // Attendre 2 secondes avant d'envoyer les résultats
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer les résultats à l'utilisateur
        await sendMessage(senderId, `Voici quelques vidéos trouvées :\n${results}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API YouTube:', error.message);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche de vidéos.");
    }
};

// Ajouter une commande pour obtenir des informations supplémentaires sur une vidéo
module.exports.getVideoDetails = async (senderId, url, type) => {
    try {
        // Vérification de la validité des paramètres
        if (!url || typeof url !== 'string' || url.trim() === '' || !type) {
            await sendMessage(senderId, "Veuillez fournir un lien valide et un type.");
            return;
        }

        // Appeler l'API YouTube pour obtenir des détails sur la vidéo
        const apiUrlDetails = `https://apiv3-2l3o.onrender.com/ytb?link=${encodeURIComponent(url)}&type=${encodeURIComponent(type)}`;
        
        const response = await axios.get(apiUrlDetails);
        
        // Récupérer les détails de la vidéo
        const details = response.data.result;

        if (!details) {
            await sendMessage(senderId, "Aucun détail trouvé pour cette vidéo.");
            return;
        }

        // Formater les détails pour l'envoi
        const videoDetails = `Titre: ${details.title}\nDescription: ${details.description}\nDurée: ${details.duration}\nURL: ${url}`;

        // Attendre 2 secondes avant d'envoyer les détails
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer les détails à l'utilisateur
        await sendMessage(senderId, `Voici les détails de la vidéo :\n${videoDetails}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API YouTube pour les détails:', error.message);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des détails de la vidéo.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Recherchez des vidéos sur YouTube.",  // Description de la commande
    usage: "Envoyez 'youtube <recherche>' pour trouver des vidéos sur YouTube."  // Comment utiliser la commande
};
