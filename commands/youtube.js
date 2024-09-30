const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, prompt) => {
    try {
        // Étape 1 : Chercher les titres de vidéo sur YouTube
        const apiUrl = `https://apiv3-2l3o.onrender.com/yts?title=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        
        // Vérifier si des vidéos sont trouvées
        if (response.data.length === 0) {
            await sendMessage(senderId, "Désolé, aucune vidéo trouvée avec ce titre.");
            return;
        }

        // Préparer une réponse avec les titres des vidéos
        let videoList = "Voici les vidéos trouvées :\n";
        response.data.forEach((video, index) => {
            videoList += `${index + 1}. ${video.title}\n`; // Afficher le titre de chaque vidéo avec un numéro
        });

        await sendMessage(senderId, videoList + "Veuillez répondre avec le numéro de la vidéo que vous souhaitez télécharger.");

        // Étape 2 : Attendre la réponse de l'utilisateur
        const waitForResponse = (event) => {
            return new Promise((resolve) => {
                const handleMessage = (response) => {
                    const userText = response.message.text.trim();
                    const videoIndex = parseInt(userText) - 1;

                    // Vérifier si l'entrée de l'utilisateur est un numéro valide
                    if (!isNaN(videoIndex) && videoIndex >= 0 && videoIndex < response.data.length) {
                        resolve(response.data[videoIndex]); // Résoudre la promesse avec la vidéo sélectionnée
                    } else {
                        sendMessage(senderId, "Veuillez entrer un numéro valide de la vidéo.");
                    }
                };

                // Écouter les messages de l'utilisateur pour obtenir le numéro de vidéo
                // Vous devrez appeler handleMessage lors de la réception d'un message
            });
        };

        const selectedVideo = await waitForResponse(); // Attendre la réponse de l'utilisateur

        // Étape 3 : Demander à l'utilisateur le type de téléchargement (audio ou vidéo)
        const typeMessage = "Souhaitez-vous télécharger en tant qu'audio ou vidéo ? Répondez par 'audio' ou 'vidéo'.";
        await sendMessage(senderId, typeMessage);

        // Attendre la réponse de l'utilisateur pour le type
        const waitForTypeResponse = (event) => {
            return new Promise((resolve) => {
                const handleMessage = (response) => {
                    const userType = response.message.text.trim().toLowerCase();

                    // Vérifier si l'entrée de l'utilisateur est valide
                    if (userType === 'audio' || userType === 'vidéo') {
                        resolve(userType); // Résoudre la promesse avec le type sélectionné
                    } else {
                        sendMessage(senderId, "Veuillez répondre par 'audio' ou 'vidéo'.");
                    }
                };

                // Écouter les messages de l'utilisateur pour obtenir le type de téléchargement
                // Vous devrez appeler handleMessage lors de la réception d'un message
            });
        };

        const downloadType = await waitForTypeResponse(); // Attendre la réponse de l'utilisateur pour le type

        // Étape 4 : Télécharger la vidéo en utilisant l'API de téléchargement
        const downloadUrl = `https://apiv3-2l3o.onrender.com/ytb?link=${encodeURIComponent(selectedVideo.link)}&type=${downloadType}`;
        const downloadResponse = await axios.get(downloadUrl);

        // Vérifier si le téléchargement a réussi
        if (downloadResponse.data.success) {
            await sendMessage(senderId, `Téléchargement terminé ! Voici votre lien : ${downloadResponse.data.link}`);
        } else {
            await sendMessage(senderId, "Désolé, le téléchargement a échoué.");
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API YouTube:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Recherche des vidéos YouTube et permet de les télécharger.",  // Description de la commande
    usage: "Envoyez 'youtube <titre>' pour rechercher et télécharger une vidéo."  // Comment utiliser la commande
};
