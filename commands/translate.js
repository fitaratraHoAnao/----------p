const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les phrases et les langues pour chaque utilisateur
const userTranslations = {};

// Liste des codes de langue valides
const validLangCodes = ['en', 'fr', 'mlg', 'es', 'de', 'it']; // Ajoutez d'autres langues si nécessaire

module.exports = async (senderId, userText) => {
    try {
        // Vérifier si l'utilisateur a déjà une phrase à traduire
        if (userTranslations[senderId]) {
            const targetLang = userText.trim().toLowerCase(); // Langue cible de l'utilisateur
            const language = userTranslations[senderId].language; // Langue source stockée dynamiquement

            // Vérifier que l'utilisateur a fourni un code de langue valide
            if (!validLangCodes.includes(targetLang)) {
                // Créer une liste des codes de langue disponibles
                const langList = validLangCodes.join(', ');
                await sendMessage(senderId, `Veuillez fournir un code de langue valide : ${langList}.`);
                return;
            }

            // Phrase à traduire
            const phraseToTranslate = userTranslations[senderId].phrase;

            // Appeler l'API MyMemory pour effectuer la traduction
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phraseToTranslate)}&langpair=${language}|${targetLang}`;
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
            // Si c'est un nouveau message, vérifier la phrase à traduire
            const prompt = userText.trim(); // Utiliser le texte utilisateur tel quel

            // Stocker la phrase et demander la langue source
            userTranslations[senderId] = {
                phrase: prompt,
                language: 'fr' // Définir la langue source par défaut à 'fr'
            };

            // Demander à l'utilisateur la langue cible
            const langList = validLangCodes.join(', ');
            await sendMessage(senderId, `Quel code de langue avez-vous utilisé pour traduire votre message ? (codes disponibles : ${langList})`);
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
