const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Mappage des signes astrologiques en anglais vers le français
const signTranslations = {
    aries: 'bélier',
    taurus: 'taureau',
    gemini: 'gémeaux',
    cancer: 'cancer',
    leo: 'lion',
    virgo: 'vierge',
    libra: 'balance',
    scorpio: 'scorpion',
    sagittarius: 'sagittaire',
    capricorn: 'capricorne',
    aquarius: 'verseau',
    pisces: 'poissons'
};

// Inverser les traductions pour permettre de reconnaître les signes en français
const frenchToEnglishSigns = Object.fromEntries(
    Object.entries(signTranslations).map(([en, fr]) => [fr, en])
);

// Fonction pour découper une chaîne en segments de 500 caractères
const splitText = (text, maxLength = 500) => {
    let result = [];
    for (let i = 0; i < text.length; i += maxLength) {
        result.push(text.slice(i, i + maxLength));
    }
    return result;
};

// Fonction pour traduire chaque segment de texte en utilisant l'API MyMemory
const translateText = async (text) => {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`;
    const response = await axios.get(apiUrl);
    return response.data.responseData.translatedText;
};

// Fonction principale
module.exports = async (senderId, messageBody) => {
    try {
        // Nettoyer l'entrée de l'utilisateur
        let sign = messageBody.trim().toLowerCase();

        // Si l'utilisateur envoie simplement "horoscope", envoyer la liste des signes astrologiques
        if (sign === 'horoscope') {
            const signList = Object.entries(signTranslations)
                .map(([en, fr]) => `${en}: '${fr}'`)
                .join('\n');
            await sendMessage(senderId, `Voici les listes des horoscopes du jour :\n${signList}`);
            return;
        }

        // Vérifier si l'utilisateur a envoyé un signe astrologique en français ou en anglais
        if (frenchToEnglishSigns[sign]) {
            sign = frenchToEnglishSigns[sign];  // Convertir en version anglaise
        }

        // Liste des signes astrologiques valides (en anglais)
        const validSigns = Object.keys(signTranslations);

        // Vérifier si le signe est valide
        if (!validSigns.includes(sign)) {
            await sendMessage(senderId, "Désolé, je ne reconnais pas ce signe. Essayez avec un signe valide (par exemple : aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces).");
            return;
        }

        // Obtenir la date du jour au format AAAA-MM-JJ
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Traduction du signe en français
        const signInFrench = signTranslations[sign];

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, `Je prépare votre horoscope pour la date du ${formattedDate} et le signe ${sign} (${signInFrench})...`);

        // Appel à l'API Horoscope
        const apiUrl = `https://ohmanda.com/api/horoscope/${sign}?date=${formattedDate}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.horoscope) {
            const horoscope = response.data.horoscope;

            // Découper le texte en segments de 500 caractères
            const segments = splitText(horoscope);

            // Traduire chaque segment
            let translatedHoroscope = '';
            for (const segment of segments) {
                const translatedSegment = await translateText(segment);
                translatedHoroscope += translatedSegment; // Combiner les traductions
            }

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer l'horoscope traduit à l'utilisateur
            await sendMessage(senderId, `Voici votre horoscope pour ${sign.charAt(0).toUpperCase() + sign.slice(1)} (${signInFrench}) en français :\n${translatedHoroscope}`);
        } else {
            // Gérer le cas où l'API ne renvoie pas d'horoscope
            await sendMessage(senderId, "Désolé, je n'ai pas pu récupérer l'horoscope pour ce signe aujourd'hui.");
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Horoscope:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de l'obtention de votre horoscope.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "horoscope",  // Le nom de la commande
    description: "Obtenez votre horoscope du jour selon votre signe astrologique.",  // Description de la commande
    usage: "Envoyez 'horoscope' pour obtenir la liste des signes disponibles, ou 'horoscope <signe>' pour obtenir l'horoscope du jour."  // Comment utiliser la commande
};
