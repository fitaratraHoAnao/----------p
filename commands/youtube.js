const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Fonction pour envoyer des messages

// Stocker les réponses pour chaque utilisateur
const userSelections = {};

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur répond à une sélection de vidéo
        if (userSelections[senderId]) {
            const userChoice = parseInt(prompt.trim(), 10); // Convertir la réponse en numéro

            if (isNaN(userChoice) || userChoice < 1 || userChoice > userSelections[senderId].videos.length) {
                return sendMessage(senderId, "Veuillez répondre avec un numéro entre 1 et 6.");
            }

            const video = userSelections[senderId].videos[userChoice - 1];
            const type = userSelections[senderId].type;

            // Appeler l'API pour récupérer le lien de téléchargement
            try {
                const apiResponse = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${video.url}&type=${type}`);

                // Vérifier si la réponse contient bien le lien
                if (!apiResponse.data || !apiResponse.data.url) {
                    console.error('Erreur API: pas de lien dans la réponse', apiResponse.data);
                    return sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération du lien vidéo.");
                }

                const downloadLink = apiResponse.data.url;

                // Envoyer le lien de la vidéo à l'utilisateur
                await sendMessage(senderId, {
                    text: `${video.title} (${video.duration})\nVoici le lien : ${downloadLink}`
                });

                // Nettoyer la sélection après envoi
                delete userSelections[senderId];
            } catch (error) {
                console.error('Erreur lors de l\'appel à l\'API pour récupérer la vidéo:', error.message);
                await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche de la vidéo.");
            }

        } else {
            const args = prompt.trim().split(/\s+/);
            const type = args[0]?.toLowerCase();
            const title = args.slice(1).join(" ");

            // Vérifier si l'utilisateur a donné un type correct
            if (!type || !['music', 'video'].includes(type)) {
                return sendMessage(senderId, "Usage incorrect. Utilisez : youtube music <titre> ou youtube video <titre>.");
            }

            // Vérifier si un titre est donné
            if (!title) {
                return sendMessage(senderId, "Veuillez ajouter un titre.");
            }

            // Appeler l'API pour rechercher des vidéos
            const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(title)}`);
            const videos = data.videos.slice(0, 6);

            if (videos.length === 0) {
                return sendMessage(senderId, "Aucune vidéo trouvée pour ce titre.");
            }

            // Stocker la sélection de l'utilisateur pour la prochaine interaction
            userSelections[senderId] = { videos, type };

            // Préparer la réponse avec les vidéos disponibles
            const videoOptions = videos.map((video, index) => `${index + 1}. ${video.title}\nDurée : ${video.duration}`).join('\n\n');
            await sendMessage(senderId, `Voici les vidéos trouvées pour "${title}". Répondez avec un numéro (1-6) pour sélectionner une vidéo :\n\n${videoOptions}`);
        }
    } catch (error) {
        console.error('Erreur lors de la recherche YouTube :', error.message);
        sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche de la vidéo.");
    }
};

// Informations sur la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Rechercher une vidéo YouTube et renvoyer le lien de téléchargement",  // Description de la commande
    usage: "Envoyez 'youtube music <titre>' ou 'youtube video <titre>' pour chercher et sélectionner une vidéo."  // Mode d'emploi
};
