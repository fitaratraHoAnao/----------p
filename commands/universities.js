const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Fonction pour récupérer les données des universités d'un pays
const sendUniversityData = async (senderId, country) => {
    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, `Recherche des universités en ${country}...`);

        // Appel à l'API avec le pays spécifié
        const apiUrl = `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`;
        const response = await axios.get(apiUrl);

        // Récupérer les données de l'API
        const universities = response.data;

        // Si des données sont trouvées, formater et envoyer la réponse
        if (universities && universities.length > 0) {
            // Boucle pour envoyer les informations sur chaque université (limité à 5 pour cet exemple)
            for (let i = 0; i < Math.min(5, universities.length); i++) {
                const university = universities[i];
                const universityInfo = `
                Nom: ${university.name}
                Site Web: ${university.web_pages[0]}
                Domaine: ${university.domains[0]}
                Pays: ${university.country}
                `;

                // Envoyer les informations sur l'université à l'utilisateur
                await sendMessage(senderId, universityInfo);

                // Attendre 1 seconde avant d'envoyer la prochaine université
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            await sendMessage(senderId, `Aucune université trouvée pour le pays : ${country}.`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API des universités:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des données des universités.');
    }
};

// Fonction principale qui traite les messages utilisateur
module.exports = async (senderId, userText) => {
    const commandParts = userText.trim().split(' ');
    
    // Vérifier si l'utilisateur a demandé des universités dans un pays spécifique
    if (commandParts[0].toLowerCase() === 'universities') {
        // Si un pays est spécifié
        const country = commandParts.slice(1).join(' '); // Extraire le pays à partir du texte de l'utilisateur

        if (country) {
            // Appel de la fonction pour récupérer et envoyer les informations des universités
            await sendUniversityData(senderId, country);
        } else {
            await sendMessage(senderId, 'Veuillez spécifier un pays après "universities", par exemple: "universities France".');
        }
    } else {
        // Si la commande est incorrecte
        await sendMessage(senderId, 'Veuillez utiliser la commande "universities <pays>" pour obtenir des informations sur les universités d\'un pays spécifique.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "universities",  // Le nom de la commande
    description: "Demandez des informations sur les universités d'un pays spécifique.",  // Description de la commande
    usage: "Envoyez 'universities <pays>' pour obtenir des informations sur les universités de ce pays."  // Comment utiliser la commande
};
