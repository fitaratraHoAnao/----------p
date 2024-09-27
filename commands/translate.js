const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les phrases et les langues pour chaque utilisateur
const userTranslations = {};

// Liste des codes de langue valides et leurs drapeaux correspondants
const validLangCodes = {
    'ar': '🇸🇦 Arabe',
    'bn': '🇧🇩 Bengali',
    'ca': '🇪🇸 Catalan',
    'cs': '🇨🇿 Tchèque',
    'da': '🇩🇰 Danois',
    'de': '🇩🇪 Allemand',
    'el': '🇬🇷 Grec',
    'en': '🇬🇧 Anglais',
    'es': '🇪🇸 Espagnol',
    'et': '🇪🇪 Estonien',
    'fa': '🇮🇷 Persan',
    'fi': '🇫🇮 Finnois',
    'fr': '🇫🇷 Français',
    'ga': '🇮🇪 Irlandais',
    'gu': '🇮🇳 Gujarati',
    'he': '🇮🇱 Hébreu',
    'hi': '🇮🇳 Hindi',
    'hr': '🇭🇷 Croate',
    'hu': '🇭🇺 Hongrois',
    'id': '🇮🇩 Indonésien',
    'it': '🇮🇹 Italien',
    'ja': '🇯🇵 Japonais',
    'jw': '🇮🇩 Javanais',
    'kn': '🇮🇳 Kannada',
    'ko': '🇰🇷 Coréen',
    'la': '🏛️ Latin',
    'lv': '🇱🇻 Letton',
    'mk': '🇲🇰 Macédonien',
    'ml': '🇮🇳 Malayalam',
    'mr': '🇮🇳 Marathi',
    'ms': '🇲🇾 Malais',
    'mt': '🇲🇹 Maltais',
    'ne': '🇳🇵 Népali',
    'nl': '🇳🇱 Néerlandais',
    'no': '🇳🇴 Norvégien',
    'pl': '🇵🇱 Polonais',
    'pt': '🇵🇹 Portugais',
    'pa': '🇮🇳 Pendjabi',
    'ro': '🇷🇴 Roumain',
    'ru': '🇷🇺 Russe',
    'si': '🇱🇰 Cinghalais',
    'sk': '🇸🇰 Slovaque',
    'sl': '🇸🇮 Slovène',
    'sv': '🇸🇪 Suédois',
    'sw': '🇹🇿 Swahili',
    'ta': '🇮🇳 Tamoul',
    'te': '🇮🇳 Télougou',
    'th': '🇹🇭 Thaï',
    'tr': '🇹🇷 Turc',
    'uk': '🇺🇦 Ukrainien',
    'ur': '🇵🇰 Ourdou',
    'vi': '🇻🇳 Vietnamien',
    'cy': '🏴 Gallois',
    'xh': '🇿🇦 Xhosa',
    'yi': '🇮🇱 Yiddish',
    'zu': '🇿🇦 Zoulou'
};

module.exports = async (senderId, userText) => {
    try {
        // Vérifier si l'utilisateur a déjà une phrase à traduire
        if (userTranslations[senderId]) {
            const targetLang = userText.trim().toLowerCase(); // Langue cible de l'utilisateur
            const sourceLang = userTranslations[senderId].language; // Langue source détectée automatiquement

            // Vérifier que l'utilisateur a fourni un code de langue valide
            if (!validLangCodes[targetLang]) {
                // Créer une liste des codes de langue disponibles
                const langList = Object.entries(validLangCodes)
                    .map(([code, name]) => `${name} (${code})`)
                    .join('\n');
                await sendMessage(senderId, `👊Bruno a sélectionné pour vous les langues disponibles pour la traduction ! Choisissez parmi ces options 🏳️‍🌈 :\n${langList}`);
                return;
            }

            // Phrase à traduire
            const phraseToTranslate = userTranslations[senderId].phrase;

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

            // Appeler l'API pour détecter la langue source automatiquement
            const detectLangUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}`;
            const detectResponse = await axios.get(detectLangUrl);

            if (detectResponse.data && detectResponse.data.responseData && detectResponse.data.responseData.language) {
                const detectedLang = detectResponse.data.responseData.language;

                // Stocker la phrase et la langue détectée
                userTranslations[senderId] = {
                    phrase: prompt,
                    language: detectedLang // Langue source détectée automatiquement
                };

                // Demander à l'utilisateur la langue cible
                const langList = Object.entries(validLangCodes)
                    .map(([code, name]) => `${name} (${code})`)
                    .join('\n');
                await sendMessage(senderId, `Langue source détectée : ${detectedLang}. 🍟👊 Bruno vous propose ces langues pour la traduction 👊🍟 :\n${langList}`);
            } else {
                await sendMessage(senderId, 'Désolé, je n\'ai pas pu détecter la langue source. Veuillez réessayer.');
            }
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
