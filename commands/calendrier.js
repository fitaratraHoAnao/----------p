const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, year) => {
    try {
        // Envoie un message de confirmation
        await sendMessage(senderId, "Je prépare le calendrier, un instant...");

        // Appel de l'API calendrier avec l'année fournie
        const apiUrl = `https://calendrier-gamma.vercel.app/recherche?calendrier=${year}`;
        const response = await axios.get(apiUrl);
        const calendrier = response.data.result;

        // Diviser par mois pour éviter les longs messages
        const moisCalendrier = calendrier.split("\n\n");

        for (const moisData of moisCalendrier) {
            if (moisData.trim()) {
                const lignes = moisData.split("\n").filter(Boolean);
                const titreMois = lignes[0]; // Ex : "Janvier 2025"
                
                // Extraire le nombre de jours et les jours de la semaine en en-tête
                const joursDuMois = [];
                for (let i = 2; i < lignes.length; i++) {
                    const jours = lignes[i].split(/\s+/).map(Number).filter(n => !isNaN(n));
                    joursDuMois.push(...jours);
                }
                
                // Calculer le premier jour du mois (ex : 3 pour mercredi)
                const premierJour = new Date(year, moisCalendrier.indexOf(moisData), 1).getDay() || 7;

                // Générer le calendrier formaté
                let message = `${titreMois}:\nn°  |  Lu |  Ma |  Me |  Je |  Ve |  Sa |  Di\n`;
                message += "-------------------------------------------\n";

                let semaine = Array(7).fill("   ");
                let semaineNum = 1;

                for (let i = 0; i < joursDuMois.length; i++) {
                    // Insérer chaque jour dans la bonne colonne
                    const indexJour = (i + premierJour - 1) % 7;
                    semaine[indexJour] = joursDuMois[i].toString().padStart(3, " ");
                    
                    // Si dimanche, ajouter la semaine et passer à la suivante
                    if (indexJour === 6 || i === joursDuMois.length - 1) {
                        message += `${semaineNum.toString().padEnd(4)}|${semaine.join(" |")}\n`;
                        semaineNum++;
                        semaine = Array(7).fill("   ");
                    }
                }

                // Envoie le mois formaté au bot
                await sendMessage(senderId, message);

                // Pause pour éviter d'envoyer trop vite
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API calendrier:", error);

        // Envoie un message d'erreur si problème
        await sendMessage(senderId, "Désolé, une erreur est survenue en récupérant le calendrier.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "calendrier",
    description: "Affiche le calendrier mois par mois pour une année spécifique.",
    usage: "Envoyez 'calendrier <année>' pour afficher le calendrier de cette année."
};
