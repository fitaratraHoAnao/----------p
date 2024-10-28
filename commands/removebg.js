const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt, attachmentUrl = null) => {
    try {
        // Initialiser une session si l'utilisateur n'en a pas encore
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForImage: false };
        }

        // Vérifier si l'utilisateur a envoyé la commande 'removebg'
        if (prompt.toLowerCase() === "removebg") {
            userSessions[senderId].waitingForImage = true;
            await sendMessage(senderId, "Envoyez-moi une photo pour que je puisse en supprimer l'arrière-plan.");
            return;
        }

        // Si le bot attend une image
        if (userSessions[senderId].waitingForImage) {
            // Vérifier si une image a été jointe
            if (!attachmentUrl) {
                await sendMessage(senderId, "Veuillez envoyer une image pour que je puisse en supprimer l'arrière-plan.");
                return;
            }

            // Appeler l'API pour supprimer l'arrière-plan
            const apiUrl = `https://remove-bg-ten.vercel.app/api/remove?url=${encodeURIComponent(attachmentUrl)}`;
            
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            if (response.status === 200) {
                const imageBuffer = Buffer.from(response.data, 'binary');
                
                // Envoyer l'image sans arrière-plan en pièce jointe
                await sendMessage(senderId, {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
                            is_reusable: true
                        }
                    }
                });

                // Réinitialiser l'état de la session pour cet utilisateur
                userSessions[senderId].waitingForImage = false;
            } else {
                await sendMessage(senderId, "Erreur : Impossible de supprimer l'arrière-plan de cette image.");
                userSessions[senderId].waitingForImage = false;
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API removebg :", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre image.");
        userSessions[senderId].waitingForImage = false;
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "removebg",  // Le nom de la commande
    description: "Supprime l'arrière-plan d'une image envoyée par l'utilisateur.",  // Description de la commande
    usage: "Envoyez 'removebg', puis envoyez une image pour obtenir la version sans arrière-plan."  // Comment utiliser la commande
};
