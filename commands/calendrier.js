const axios = require('axios');
const sendMessage = require('../handles/sendMessage');
const userSessions = {}; // Stocker les sessions utilisateurs

module.exports = async (senderId, prompt) => {
    try {
        let year;

        // Vérifier si l'utilisateur a spécifié une année ou utiliser la dernière année demandée
        const words = prompt.trim().split(' ');
        if (words.length > 1) {
            year = words[1];
        } else {
            year = userSessions[senderId] || new Date().getFullYear();
        }

        // Mettre à jour la session utilisateur avec la nouvelle année
        userSessions[senderId] = year;

        // Message de confirmation
        await sendMessage(senderId, `Message reçu, je prépare le calendrier pour ${year}...`);

        // Appeler l'API calendrier
        const apiUrl = `https://calendrier-api.vercel.app/recherche?calendrier=${year}`;
        const response = await axios.get(apiUrl);

        // Récupérer la bonne clé dans la réponse de l'API
        const jours = response.data[`calendrier_${year}`][0].jours;

        // Créer un tableau pour chaque mois avec les jours correspondants
        const mois = {
            "JANVIER": [],
            "FEVRIER": [],
            "MARS": [],
            "AVRIL": [],
            "MAI": [],
            "JUIN": [],
            "JUILLET": [],
            "AOUT": [],
            "SEPTEMBRE": [],
            "OCTOBRE": [],
            "NOVEMBRE": [],
            "DECEMBRE": []
        };

        // Répartition des jours dans les mois
        jours.forEach(jour => {
            const dayNumber = parseInt(jour.nombre, 10);
            if (dayNumber <= 31) mois["JANVIER"].push(jour);
            else if (dayNumber <= 59) mois["FEVRIER"].push(jour);
            else if (dayNumber <= 90) mois["MARS"].push(jour);
            else if (dayNumber <= 120) mois["AVRIL"].push(jour);
            else if (dayNumber <= 151) mois["MAI"].push(jour);
            else if (dayNumber <= 181) mois["JUIN"].push(jour);
            else if (dayNumber <= 212) mois["JUILLET"].push(jour);
            else if (dayNumber <= 243) mois["AOUT"].push(jour);
            else if (dayNumber <= 273) mois["SEPTEMBRE"].push(jour);
            else if (dayNumber <= 304) mois["OCTOBRE"].push(jour);
            else if (dayNumber <= 334) mois["NOVEMBRE"].push(jour);
            else mois["DECEMBRE"].push(jour);
        });

        // Envoyer chaque mois sans délai entre chaque message
        for (const [nomMois, joursDuMois] of Object.entries(mois)) {
            if (joursDuMois.length > 0) {
                let message = `👉 ${nomMois.toUpperCase()} :\n`;
                
                joursDuMois.forEach(jour => {
                    message += `\t${jour.lettre}\t✅${jour.nombre}\t✅${jour.description}`;
                    if (jour.info) message += `\t${jour.info}`;
                    message += '\n';
                });

                // Envoyer le message pour le mois courant
                await sendMessage(senderId, message);
            }
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API calendrier:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "calendrier", // Le nom de la commande
    description: "Affiche le calendrier pour l'année spécifiée ou la dernière année demandée.", // Description de la commande
    usage: "Envoyez 'calendrier <année>' pour obtenir le calendrier de cette année ou simplement 'calendrier' pour la dernière année demandée." // Comment utiliser la commande
};
