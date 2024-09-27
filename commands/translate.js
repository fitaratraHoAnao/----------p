const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Créer un objet pour stocker le texte et la langue cible temporairement par utilisateur
let userSessions = {};

module.exports = async (senderId, userText) => {
    // Extraire la phrase en retirant le préfixe 'translate' et en supprimant les espaces superflus
    const prompt = userText.slice(9).trim();

    // Si la session utilisateur existe déjà et contient une phrase, on attend une langue cible
    if (userSessions[senderId] && userSessions[senderId].phrase) {
        const targetLang = prompt.toLowerCase().trim();

        // Vérifier que l'utilisateur a fourni un code de langue valide (2 caractères)
        const validLangCodes = ['en', 'fr', 'mlg', 'es', 'de', 'it']; // Ajoutez d'autres langues si nécessaire

        if (!validLangCodes.includes(targetLang)) {
            await sendMessage(senderId, 'Veuillez fournir un code de langue valide (e.g., "en" pour anglais, "fr" pour français, "mlg" pour malgache).');
            return;
        }

        const phraseToTranslate = userSessions[senderId].phrase;

        try {
            // Appeler l'API MyMemory pour effectuer la traduction
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phraseToTranslate)}&langpair=fr|${targetLang}`;
            const response = await axios.get(apiUrl);

            // Vérifier si la réponse API contient bien la traduction
            if (response.data && response.data.responseData && response.data.responseData.translatedText) {
                const translatedText = response.data.responseData.translatedText;

                // Envoyer la traduction à l'utilisateur
                await sendMessage(senderId, translatedText);

                // Réinitialiser la session de l'utilisateur après la traduction
                delete userSessions[senderId];
            } else {
                await sendMessage(senderId, 'Désolé, je n\'ai pas pu obtenir la traduction de votre phrase.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API MyMemory:', error.message || error);
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la traduction de votre phrase.');
        }
    } 
    // Si l'utilisateur n'a pas encore fourni de langue cible, on commence la traduction
    else {
        // Vérifier si le prompt est vide
        if (!prompt) {
            await sendMessage(senderId, 'Veuillez fournir une phrase à traduire.');
            return;
        }

        // Stocker la phrase dans la session utilisateur
        userSessions[senderId] = {
            phrase: prompt
        };

        // Demander à l'utilisateur la langue cible
        await sendMessage(senderId, 'Dans quelle langue souhaitez-vous traduire votre message ? (e.g., "en" pour anglais, "fr" pour français, "mlg" pour malgache)');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "translate",  // Le nom de la commande
    description: "Traduisez une phrase dans la langue de votre choix en utilisant l'API MyMemory.",  // Description de la commande
    usage: "Envoyez 'translate <votre phrase>' pour commencer la traduction."  // Comment utiliser la commande
};
