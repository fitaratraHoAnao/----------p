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
        console.log(response.data); // Vérifiez la réponse ici

        // Récupérer les résultats de la recherche
        const items = response.data.videos; // Utilisez 'videos' ici

        if (!items || items.length === 0) {
            await sendMessage(senderId, "Aucune vidéo trouvée pour votre recherche.");
            return;
        }

        // Formater les résultats pour l'envoi
        const results = items.map(item => {
            const videoTitle = item.title;
            const videoUrl = item.url;
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
