const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL des APIs
const QUOTE_API_URL = 'https://hindi-quotes.vercel.app/random';
const TRANSLATION_API_URL = 'https://api.mymemory.translated.net/get';

module.exports = async (senderId, userText) => {
    // Vérifier si la commande contient le mot-clé 'quote'
    if (!userText.toLowerCase().startsWith('quote')) {
        await sendMessage(senderId, 'Utilisez "quote" pour demander une citation en hindi.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "⚙️ Recherche d'une citation en hindi...");

        // Appeler l'API pour récupérer une citation aléatoire
        const response = await axios.get(QUOTE_API_URL);

        // Vérifier si la réponse contient une citation
        const data = response.data;
        if (!data || !data.quote) {
            await sendMessage(senderId, '🥺 Désolé, je n\'ai pas pu trouver de citation pour vous.');
            return;
        }

        // Extraire la citation de la réponse
        const quote = data.quote;

        // Traduire la citation en français en appelant l'API MyMemory
        const translationResponse = await axios.get(TRANSLATION_API_URL, {
            params: {
                q: quote,
                langpair: 'hi|fr' // Traduire de l'hindi vers le français
            }
        });

        const translatedText = translationResponse.data.responseData.translatedText;

        // Envoyer la citation traduite à l'utilisateur
        await sendMessage(senderId, `📝 Voici une citation traduite en français :\n\n"${translatedText}"`);
    } catch (error) {
        console.error('Erreur lors de l\'appel aux APIs :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, '❌ Une erreur s\'est produite lors de la récupération ou de la traduction de la citation.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "quote", // Le nouveau nom de la commande
    description: "Obtenez une citation inspirante en hindi traduite en français.", // Nouvelle description
    usage: "Envoyez 'quote' pour obtenir une citation traduite en français." // Nouveau mode d'emploi
};
