const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Un objet pour stocker l'état de recherche de chaque utilisateur
const userSearchState = {};

// Fonction principale pour traiter la commande
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

        // Modifier l'URL de l'API pour la recherche
        const apiUrl = `https://bible-en-francais.vercel.app/recherche?query=${searchQuery}&page=${page}`;
        const response = await axios.get(apiUrl);

        // Récupérer les articles de la réponse
        const articles = response.data.versets || [];
        userSearchState[senderId].articles = articles; // Stocker les articles pour la pagination

        // Nettoyer les caractères indésirables dans les articles
        const cleanText = (text) => text.replace(/[^a-zA-Z0-9À-ÿ.,!?'"() ]/g, ''); // Exemple de nettoyage

        // Envoyer les articles deux par deux
        for (let i = 0; i < articles.length; i += 2) {
            const pair = articles.slice(i, i + 2); // Prendre deux articles à la fois
            let pairReply = "";
            pair.forEach((article, index) => {
                // Format des versets
                pairReply += `✍️ Verset ${i + index + 1} ✍️ : ${cleanText(article)}\n`;
            });

            // Envoyer le message de la paire
            await sendMessage(senderId, pairReply);

            // Attendre 2 secondes entre chaque envoi
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Si aucun article n'est trouvé
        if (articles.length === 0) {
            await sendMessage(senderId, "Aucun résultat trouvé.");
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de citation:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre recherche.");
    }
};

// Route pour afficher tous les livres de la Bible
module.exports.lireLaBible = async (senderId) => {
    try {
        const apiUrl = `https://bible-en-francais.vercel.app/lire-la-bible`;
        const response = await axios.get(apiUrl);

        const bibleData = response.data;
        let message = "Voici la structure de la Bible :\n\n";

        Object.keys(bibleData).forEach(testament => {
            message += `📖 ${testament} :\n`;
            Object.keys(bibleData[testament]).forEach(section => {
                message += `👉 ${section} : ${bibleData[testament][section].join(', ')}\n`;
            });
            message += '\n';
        });

        await sendMessage(senderId, message);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
        await sendMessage(senderId, "Erreur lors du chargement de la Bible.");
    }
};

// Route pour chercher un verset spécifique
module.exports.chercherVerset = async (senderId, question) => {
    try {
        const apiUrl = `https://bible-en-francais.vercel.app/verser?question=${encodeURIComponent(question)}`;
        const response = await axios.get(apiUrl);

        const versets = response.data.versets || [];
        let message = `Résultat pour "${question}" :\n\n`;
        message += versets.join('\n');

        await sendMessage(senderId, message);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
        await sendMessage(senderId, "Erreur lors de la recherche du verset.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "baiboly",  // Le nom de la commande
    description: "Permet de rechercher des versets de la Bible et de lire la structure de la Bible.",  // Description de la commande
    usage: "Envoyez 'baiboly <terme>' pour rechercher des versets ou 'lire-la-bible' pour afficher tous les livres."  // Comment utiliser la commande
};
