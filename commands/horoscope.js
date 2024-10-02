const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, sign) => {
    try {
        // Vérifier si le signe est valide
        const validSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        if (!validSigns.includes(sign.toLowerCase())) {
            await sendMessage(senderId, "Désolé, je ne reconnais pas ce signe. Essayez avec un signe valide (par exemple : aries, taurus, etc.).");
            return;
        }

        // Obtenir la date du jour au format AAAA-MM-JJ
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Mois commence à 0, donc on ajoute 1
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Je prépare votre horoscope pour la date du " + formattedDate + "...");

        // Construire l'URL de l'API avec le signe et la date du jour
        const apiUrl = `https://ohmanda.com/api/horoscope/${sign.toLowerCase()}?date=${formattedDate}`;
        const response = await axios.get(apiUrl);

        // Vérifier que la réponse contient les informations attendues
        if (response.data && response.data.horoscope) {
            // Extraire l'horoscope du corps de la réponse
            const horoscope = response.data.horoscope;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer l'horoscope à l'utilisateur
            await sendMessage(senderId, horoscope);
        } else {
            // Gérer le cas où l'API ne renvoie pas l'horoscope
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
