const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les phrases et les langues pour chaque utilisateur
const userTranslations = {};

// Liste des codes de langue valides
const validLangCodes = ['🇸🇦 ar', '🇧🇩 bn', '🇨🇦 ca', '🇨🇿 cs', '🇩🇰 da', '🇩🇪 de', '🇬🇷 el', '🇬🇧 en', '🇪🇸 es', '🇪🇪 et', '🇮🇷 fa', '🇫🇮 fi', '🇫🇷 fr', '🇮🇪 ga', '🇮🇳 gu', '🇮🇱 he', '🇮🇳 hi', '🇭🇷 hr', '🇭🇺 hu', '🇮🇩 id', '🇮🇹 it', '🇯🇵 ja', '🇮🇩 jw', '🇮🇳 kn', '🇰🇷 ko', '🇻🇦 la', '🇱🇻 lv', '🇲🇰 mk', '🇮🇳 ml', '🇮🇳 mr', '🇲🇾 ms', '🇲🇹 mt', '🇳🇵 ne', '🇳🇱 nl', '🇳🇴 no', '🇵🇱 pl', '🇵🇹 pt', '🇮🇳 pa', '🇷🇴 ro', '🇷🇺 ru', '🇱🇰 si', '🇸🇰 sk', '🇸🇮 sl', '🇸🇪 sv', '🇹🇿 sw', '🇮🇳 ta', '🇮🇳 te', '🇹🇭 th', '🇹🇷 tr', '🇺🇦 uk', '🇵🇰 ur', '🇻🇳 vi', '🏴 cy', '🇿🇦 xh', '🇮🇱 yi', '🇿🇦 zu'];
module.exports = async (senderId, userText) => {
    try {
        // Vérifier si l'utilisateur a déjà une phrase à traduire
        if (userTranslations[senderId]) {
            const targetLang = userText.trim().toLowerCase(); // Langue cible de l'utilisateur

            // Vérifier que l'utilisateur a fourni un code de langue valide
            if (!validLangCodes.includes(targetLang)) {
                const langList = validLangCodes.join(', ');
                await sendMessage(senderId, `Veuillez fournir un code de langue valide : ${langList}.`);
                return;
            }

            // Phrase à traduire
            const phraseToTranslate = userTranslations[senderId].phrase;
            const sourceLang = userTranslations[senderId].language;

            // Appeler l'API MyMemory pour effectuer la traduction
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phraseToTranslate)}&langpair=${sourceLang}|${targetLang}`;
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

            // Détecter automatiquement la langue source
            const detectionApiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}&langpair=auto|${validLangCodes.join(',')}`;
            const detectionResponse = await axios.get(detectionApiUrl);
            const detectedLang = detectionResponse.data.responseData.lang || 'fr'; // Langue par défaut si détection échoue

            // Stocker la phrase et la langue détectée
            userTranslations[senderId] = {
                phrase: prompt,
                language: detectedLang // Langue source détectée
            };

            // Demander à l'utilisateur la langue cible
            const langList = validLangCodes.join(', ');
            await sendMessage(senderId, `Langue source détectée : ${detectedLang}. Quel code de langue cible souhaitez-vous utiliser ? (codes disponibles : ${langList})`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API MyMemory:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "translate",  // Le nom de la commande
    description: "Traduisez une phrase dans la langue de votre choix en utilisant l'API MyMemory.",  // Description de la commande
    usage: "Envoyez 'translate <votre phrase>' pour commencer la traduction."  // Comment utiliser la commande
};

