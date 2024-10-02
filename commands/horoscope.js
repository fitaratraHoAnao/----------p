const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, chosenZodiac) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Je cherche votre horoscope...");

        // Obtenir la date actuelle au format YYYY-MM-DD
        const todayDate = new Date().toISOString().split('T')[0];

        // Construire l'URL de l'API avec le signe du zodiaque et la date
        const apiUrl = `https://ohmanda.com/api/horoscope/${chosenZodiac.sign}?date=${todayDate}`;
        const response = await axios.get(apiUrl);

        // Vérifier que la réponse contient bien les données attendues
        if (response.data && response.data.horoscope) {
            const horoscope = response.data.horoscope;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer l'horoscope à l'utilisateur
            await sendMessage(senderId, `Voici votre horoscope pour le signe ${chosenZodiac.sign} :\n\n${horoscope}`);
        } else {
            // Gestion de cas où la réponse est mal formée
            await sendMessage(senderId, "Désolé, je n'ai pas pu obtenir votre horoscope.");
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Horoscope:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        let errorMessage = "Désolé, une erreur s'est produite lors du traitement de votre horoscope.";
        if (error.response) {
            // Si l'API a renvoyé une erreur
            errorMessage += ` Code d'erreur: ${error.response.status}`;
        }

        await sendMessage(senderId, errorMessage);
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "horoscope",  // Le nom de la commande
    description: "Obtenez votre horoscope quotidien.",  // Description de la commande
    usage: "Envoyez 'horoscope <signe>' pour obtenir l'horoscope du jour pour un signe du zodiaque."  // Comment utiliser la commande
};
