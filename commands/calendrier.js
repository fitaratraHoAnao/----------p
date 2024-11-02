const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

function splitMessageIntoChunks(message, maxLength = 2000) {
    const chunks = [];
    let start = 0;

    while (start < message.length) {
        chunks.push(message.slice(start, start + maxLength));
        start += maxLength;
    }

    return chunks;
}

const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        let year;

        const words = prompt.trim().split(' ');
        if (words.length > 1) {
            year = words[1];
        } else {
            year = userSessions[senderId] || new Date().getFullYear();
        }

        userSessions[senderId] = year;
        await sendMessage(senderId, `Message reçu, je prépare le calendrier pour ${year}...`);

        const apiUrl = `https://calendrier-api.vercel.app/recherche?calendrier=${year}`;
        const response = await axios.get(apiUrl);

        const jours = response.data[`calendrier_${year}`][0].jours;

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

        // Distribution des jours dans les mois
        jours.forEach(jour => {
            const dayNumber = parseInt(jour.nombre, 10);
            if (dayNumber >= 1 && dayNumber <= 31) mois["JANVIER"].push(jour);
            if (dayNumber >= 32 && dayNumber <= 59) mois["FEVRIER"].push(jour);
            if (dayNumber >= 60 && dayNumber <= 90) mois["MARS"].push(jour);
            if (dayNumber >= 91 && dayNumber <= 120) mois["AVRIL"].push(jour);
            if (dayNumber >= 121 && dayNumber <= 151) mois["MAI"].push(jour);
            if (dayNumber >= 152 && dayNumber <= 181) mois["JUIN"].push(jour);
            if (dayNumber >= 182 && dayNumber <= 212) mois["JUILLET"].push(jour);
            if (dayNumber >= 213 && dayNumber <= 243) mois["AOUT"].push(jour);
            if (dayNumber >= 244 && dayNumber <= 273) mois["SEPTEMBRE"].push(jour);
            if (dayNumber >= 274 && dayNumber <= 304) mois["OCTOBRE"].push(jour);
            if (dayNumber >= 305 && dayNumber <= 334) mois["NOVEMBRE"].push(jour);
            if (dayNumber >= 335 && dayNumber <= 365) mois["DECEMBRE"].push(jour);
        });

        for (const [nomMois, joursDuMois] of Object.entries(mois)) {
            if (joursDuMois.length > 0) {
                let message = `👉 ${nomMois.toUpperCase()} :\n`;
                
                joursDuMois.forEach(jour => {
                    message += `\t✅${jour.nombre}\t✅${jour.description}`;
                    if (jour.info) message += `\t${jour.info}`;
                    message += '\n';
                });

                const messageChunks = splitMessageIntoChunks(message);

                for (const chunk of messageChunks) {
                    await sendMessage(senderId, chunk);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API calendrier:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Informations de la commande
module.exports.info = {
    name: "calendrier",
    description: "Affiche le calendrier pour l'année spécifiée ou la dernière année demandée.",
    usage: "Envoyez 'calendrier <année>' pour obtenir le calendrier de cette année ou simplement 'calendrier' pour la dernière année demandée."
};
