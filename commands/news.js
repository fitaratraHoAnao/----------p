const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API pour récupérer les actualités
        const apiUrl = `https://news-api-mu-lime.vercel.app/news?country=us`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient des articles
        if (response.data.articles && response.data.articles.length > 0) {
            let fullText = '';

            // Construire une réponse avec les titres et les URL des articles
            response.data.articles.forEach((article, index) => {
                fullText += `#${index + 1} ${article.title}\n${article.url}\n\n`;
            });

            // Fonction pour découper le texte en morceaux de 2000 caractères
            const chunkText = (text, size) => {
                const chunks = [];
                for (let i = 0; i < text.length; i += size) {
                    chunks.push(text.slice(i, i + size));
                }
                return chunks;
            };

            // Diviser la réponse en morceaux de 2000 caractères
            const chunks = chunkText(fullText, 2000);

            // Envoyer chaque morceau successivement
            for (const chunk of chunks) {
                await sendMessage(senderId, chunk);
                // Petite pause entre les messages pour éviter de surcharger l'utilisateur
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            await sendMessage(senderId, "Aucune actualité trouvée pour le moment.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "news",  // Le nom de la commande
    description: "Récupère les dernières actualités.",  // Description de la commande
    usage: "Envoyez 'news' pour voir les dernières actualités."  // Comment utiliser la commande
};
