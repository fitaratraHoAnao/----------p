const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

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

// Mappage des signes astrologiques en anglais vers le français et leurs dates
const signDetails = {
    aries: { french: 'bélier', dates: '21 mars - 19 avril' },
    taurus: { french: 'taureau', dates: '20 avril - 20 mai' },
    gemini: { french: 'gémeaux', dates: '21 mai - 20 juin' },
    cancer: { french: 'cancer', dates: '21 juin - 22 juillet' },
    leo: { french: 'lion', dates: '23 juillet - 22 août' },
    virgo: { french: 'vierge', dates: '23 août - 22 septembre' },
    libra: { french: 'balance', dates: '23 septembre - 22 octobre' },
    scorpio: { french: 'scorpion', dates: '23 octobre - 21 novembre' },
    sagittarius: { french: 'sagittaire', dates: '22 novembre - 21 décembre' },
    capricorn: { french: 'capricorne', dates: '22 décembre - 19 janvier' },
    aquarius: { french: 'verseau', dates: '20 janvier - 18 février' },
    pisces: { french: 'poissons', dates: '19 février - 20 mars' }
};

// Fonction principale
module.exports = async (senderId, message) => {
    try {
        // Nettoyer l'entrée de l'utilisateur
        const userMessage = message.trim().toLowerCase();

        // Liste des signes astrologiques valides
        const validSigns = Object.keys(signDetails);

        // Si l'utilisateur envoie juste "horoscope", afficher la liste des signes avec les dates
        if (userMessage === 'horoscope') {
            let horoscopeList = 'Voici les listes des horoscopes du jour avec leurs dates :\n';
            for (const sign in signDetails) {
                const { french, dates } = signDetails[sign];
                horoscopeList += `- ${sign}: ${french} (${dates})\n`;
            }
            await sendMessage(senderId, horoscopeList);
            return;
        }

        // Vérifier si l'utilisateur a envoyé un signe valide ou sa traduction en français
        let sign = validSigns.find(sign => sign === userMessage || signDetails[sign].french === userMessage);

        // Si le signe n'est pas reconnu, informer l'utilisateur
        if (!sign) {
            await sendMessage(senderId, "Désolé, je ne reconnais pas ce signe. Essayez avec un signe valide (par exemple : aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces).");
            return;
        }

        // Obtenir la date du jour au format AAAA-MM-JJ
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Obtenir la traduction en français et les dates du signe sélectionné
        const { french: signInFrench, dates: signDates } = signDetails[sign];

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, `Je prépare votre horoscope pour la date du ${formattedDate} et le signe ${sign} (${signInFrench} : ${signDates})...`);

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
    usage: "Envoyez 'horoscope <signe>' pour obtenir l'horoscope de votre signe (par exemple : horoscope aries)."  // Comment utiliser la commande
};
