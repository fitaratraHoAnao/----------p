const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Un objet pour stocker l'état de recherche de chaque utilisateur
const userSearchState = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur a déjà effectué une recherche
        if (!userSearchState[senderId]) {
            // Initialiser l'état de recherche pour cet utilisateur
            userSearchState[senderId] = {
                query: null,
                page: 1,
                articles: [],
            };
        }

        // Vérifier si l'utilisateur a demandé une nouvelle recherche ou une pagination
        if (!isNaN(prompt)) {
            // Si l'entrée est un nombre, c'est une demande de page
            const page = parseInt(prompt);
            if (userSearchState[senderId].query) {
                userSearchState[senderId].page = page; // Mettre à jour la page demandée
            } else {
                await sendMessage(senderId, "Veuillez d'abord effectuer une recherche.");
                return;
            }
        } else {
            // C'est une nouvelle recherche
            userSearchState[senderId].query = prompt; // Mettre à jour la requête
            userSearchState[senderId].page = 1; // Réinitialiser à la première page
        }

        // Préparer la recherche
        const searchQuery = encodeURIComponent(userSearchState[senderId].query);
        const page = userSearchState[senderId].page;

        // Appeler l'API avec la requête de recherche
        const apiUrl = `https://citation-mu.vercel.app/search?query=${searchQuery}&page=${page}`;
        const response = await axios.get(apiUrl);

        // Récupérer les articles de la réponse
        const articles = response.data.articles;
        let reply = `Voici les résultats de votre recherche sur "${userSearchState[senderId].query}" (Page ${page}):\n\n`;

        // Formater les résultats
        if (articles.length === 0) {
            reply += "Aucun résultat trouvé.";
        } else {
            articles.forEach(article => {
                reply += `**Titre :** ${article.title}\n`;
                reply += `**Auteur :** ${article.author || 'Inconnu'}\n`;
                reply += `**Date :** ${article.date}\n`;
                reply += `**Résumé :** ${article.summary}\n\n`;
            });
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de citation:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre recherche.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "citation",  // Le nom de la commande
    description: "Permet de rechercher des articles sur des sujets variés et de naviguer entre les pages de résultats.",  // Description de la commande
    usage: "Envoyez 'citation <terme>' pour rechercher des articles ou '1', '2', etc. pour naviguer entre les pages."  // Comment utiliser la commande
};
