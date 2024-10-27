const axios = require('axios');

const sendMessage = async (recipientId, messageContent) => {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    let messageData;

    // Vérifier si le contenu est une chaîne de texte
    if (typeof messageContent === 'string') {
        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageContent
            }
        };
    }
    // Vérifier si le contenu est un objet avec une pièce jointe (image, audio, vidéo, etc.)
    else if (messageContent.attachment) {
        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: messageContent.attachment
            }
        };
    }
    // Sinon, vérifier si messageContent est un objet avec un tableau de fichiers
    else if (messageContent.files && messageContent.files.length > 0) {
        let fileType = messageContent.type || 'image'; // Par défaut, on envoie des images, mais on peut spécifier "audio" ou "video"

        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: fileType, // "image", "audio", "video", etc.
                    payload: {
                        url: messageContent.files[0], // Envoi du premier fichier
                        is_reusable: true // Optionnel, permet au fichier d'être réutilisé
                    }
                }
            }
        };
    } else {
        console.error('Contenu du message non valide.');
        return;
    }

    try {
        const response = await axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData);
        console.log('Message envoyé avec succès:', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error.response ? error.response.data : error.message);
    }
};

// Fonction pour envoyer le texte suivi de l'image
const sendTextThenImage = async (recipientId, text, imageUrl) => {
    // Envoyer le message texte
    await sendMessage(recipientId, text);

    // Ajouter un léger délai avant d'envoyer l'image
    setTimeout(async () => {
        // Envoyer le message image
        await sendMessage(recipientId, {
            files: [imageUrl],
            type: 'image'
        });
    }, 1000); // 1 seconde de délai
};

module.exports = { sendMessage, sendTextThenImage };
