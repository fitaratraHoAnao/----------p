const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

const userSessions = {};

module.exports = async (senderId, prompt, attachmentUrl = null) => {
    try {
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForImage: false };
        }

        if (prompt.toLowerCase() === "removebg") {
            userSessions[senderId].waitingForImage = true;
            await sendMessage(senderId, "Envoyez-moi une photo pour que je puisse en supprimer l'arrière-plan.");
            return;
        }

        if (userSessions[senderId].waitingForImage) {
            if (!attachmentUrl) {
                await sendMessage(senderId, "Veuillez envoyer une image pour que je puisse en supprimer l'arrière-plan.");
                return;
            }

            const apiUrl = `https://remove-bg-ten.vercel.app/api/remove?url=${encodeURIComponent(attachmentUrl)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (response.status === 200) {
                const imageBuffer = Buffer.from(response.data, 'binary').toString('base64');
                await sendMessage(senderId, {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: `data:image/png;base64,${imageBuffer}`,
                            is_reusable: true
                        }
                    }
                });
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

module.exports.info = {
    name: "removebg",
    description: "Supprime l'arrière-plan d'une image envoyée par l'utilisateur.",
    usage: "Envoyez 'removebg', puis envoyez une image pour obtenir la version sans arrière-plan."
};
