const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Initialiser une session si l'utilisateur n'en a pas
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForElement: true };
            await sendMessage(senderId, "Veuillez fournir le nom de l'élément chimique pour obtenir ses informations.");
            return;
        }

        // Si un élément est en attente, appeler l'API de tableau périodique
        if (userSessions[senderId].waitingForElement) {
            const elementName = encodeURIComponent(prompt);
            const apiUrl = `https://api.popcat.xyz/periodic-table?element=${elementName}`;
            const response = await axios.get(apiUrl);

            // Extraire les informations de l'élément
            const elementData = response.data;
            let reply = `**Nom:** ${elementData.name}\n` +
                        `**Symbole:** ${elementData.symbol}\n` +
                        `**Numéro atomique:** ${elementData.atomic_number}\n` +
                        `**Masse atomique:** ${elementData.atomic_mass}\n` +
                        `**Période:** ${elementData.period}\n` +
                        `**État:** ${elementData.phase}\n` +
                        `**Découvert par:** ${elementData.discovered_by}\n\n` +
                        `**Résumé:** ${elementData.summary}`;

            // Envoyer le message texte avec les informations de l'élément
            await sendMessage(senderId, reply);

            // Télécharger l'image de l'élément
            const imageUrl = elementData.image;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');

            // Envoyer l'image en tant que pièce jointe
            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: 'data:image/jpeg;base64,' + imageBuffer.toString('base64'),
                        is_reusable: true
                    }
                }
            });

            // Réinitialiser la session pour attendre un nouvel élément
            userSessions[senderId].waitingForElement = true;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'élément:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "periodique",  // Le nom de la commande
    description: "Permet de rechercher des informations sur un élément chimique.",  // Description de la commande
    usage: "Envoyez 'periodique <nom de l'élément>' pour obtenir des détails sur l'élément chimique."  // Comment utiliser la commande
};
