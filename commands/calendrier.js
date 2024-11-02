const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Garder une trace de l'état d'avancement de chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur demande un calendrier pour une année spécifique
        if (prompt.startsWith("calendrier")) {
            const year = prompt.split(" ")[1].trim();
            const apiUrl = `https://calendrier-api.vercel.app/recherche?calendrier=${year}`;
            const response = await axios.get(apiUrl);

            const calendrierData = response.data[`calendrier_${year}`];
            if (!calendrierData) {
                await sendMessage(senderId, "Désolé, aucune donnée trouvée pour cette année.");
                return;
            }

            // Enregistrer les données de l'utilisateur pour les réponses successives
            userSessions[senderId] = {
                calendrierData,
                currentMonthIndex: 0
            };

            // Envoyer le premier mois
            await sendNextMonth(senderId);
        } else if (prompt.toLowerCase() === "suivant") {
            // Envoyer le mois suivant si "suivant" est envoyé
            await sendNextMonth(senderId);
        } else {
            await sendMessage(senderId, "Pour afficher le calendrier, envoyez 'calendrier <année>'. Pour passer au mois suivant, envoyez 'suivant'.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API du calendrier:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

async function sendNextMonth(senderId) {
    const session = userSessions[senderId];
    if (!session) {
        await sendMessage(senderId, "Commencez par demander une année, ex: 'calendrier 2024'.");
        return;
    }

    const { calendrierData, currentMonthIndex } = session;

    // Si tous les mois ont été envoyés, informer l'utilisateur
    if (currentMonthIndex >= calendrierData.length) {
        await sendMessage(senderId, "Vous avez reçu tous les mois de l'année.");
        delete userSessions[senderId];
        return;
    }

    // Obtenir les données du mois actuel
    const mois = calendrierData[currentMonthIndex];
    const moisNom = mois.mois; // Assurez-vous d'accéder correctement à la clé "mois"
    
    // Vérifiez que le nom du mois existe avant d'afficher
    if (!moisNom) {
        await sendMessage(senderId, "Erreur : le nom du mois est introuvable.");
        delete userSessions[senderId];
        return;
    }

    const formattedMonth = mois.jours.map(jour => 
        `Jour : ${jour.nombre} - ${jour.description} (${jour.lettre})${jour.info ? ' - Info : ' + jour.info : ''}`
    ).join('\n');

    // Envoyer le mois formaté avec le nom du mois
    await sendMessage(senderId, `--- Mois : ${moisNom} ---\n${formattedMonth}`);

    // Mettre à jour l'index pour le prochain mois
    session.currentMonthIndex++;
}

// Ajouter les informations de la commande
module.exports.info = {
    name: "calendrier",
    description: "Affiche le calendrier pour une année spécifiée mois par mois. Envoyez 'suivant' pour passer au mois suivant.",
    usage: "Envoyez 'calendrier <année>' pour démarrer, puis 'suivant' pour voir les mois successifs."
};
