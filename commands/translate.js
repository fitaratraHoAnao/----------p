const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les phrases et les langues pour chaque utilisateur
const userTranslations = {};

module.exports = async (senderId, userText) => {
    try {
        // Vérifier si l'utilisateur a déjà une phrase à traduire
        if (userTranslations[senderId]) {
            const targetLang = userText.trim().toLowerCase(); // Langue cible de l'utilisateur

            // Liste des codes de langue valides
            const validLangCodes = ['en', 'fr', 'mlg', 'es', 'de', 'it']; // Ajoutez d'autres langues si nécessaire

            // Vérifier que l'utilisateur a fourni un code de langue valide
            if (!validLangCodes.includes(targetLang)) {
                await sendMessage(senderId, 'Veuillez fournir un code de langue valide (e.g., "en" pour anglais, "fr" pour français, "mlg" pour malgache).');
                return;
            }

            // Phrase à traduire
            const phraseToTranslate = userTranslations[senderId].phrase;

            // Appeler l'API MyMemory pour effectuer la traduction
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phraseToTranslate)}&langpair=fr|${targetLang}`;
            const response = await axios.get(apiUrl);

            // Vérifier si la réponse API contient bien la traduction
            if (response.data && response.data.responseData && response.data.responseData.translatedText) {
                const translatedText = response.data.responseData.translatedText;

                // Envoyer la traduction à l'utilisateur
                await sendMessage(senderId, translatedText);

                // Réinitialiser la session de l'utilisateur après la traduction
                delete userTranslations[senderId];
            } else {
                await sendMessage(senderId, 'Désolé, je n\'ai pas pu obtenir la traduction de votre phrase.');
            }
        } else {
            // Si l'utilisateur n'a pas encore fourni de phrase à traduire
            const prompt = userText.slice(9).trim(); // Supprimer le préfixe 'translate'

            // Vérifier si le prompt est vide
            if (!prompt) {
                await sendMessage(senderId, 'Veuillez fournir une phrase à traduire.');
                return;
            }

            // Stocker la phrase dans la session utilisateur
            userTranslations[senderId] = {
                phrase: prompt
            };

            // Demander à l'utilisateur la langue cible
            await sendMessage(senderId, 'Dans quelle langue souhaitez-vous traduire votre message ? (e.g., "en" pour anglais, "fr" pour français, "mlg" pour malgache)');
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API MyMemory:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "translate",  // Le nom de la commande
    description: "Traduisez une phrase dans la langue de votre choix en utilisant l'API MyMemory.",  // Description de la commande
    usage: "Envoyez 'translate <votre phrase>' pour commencer la traduction."  // Comment utiliser la commande
};
