const axios = require('axios');

const sendMessage = (recipientId, messageContent) => {
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
    // Vérifier si le contenu est un objet avec une pièce jointe (image, audio, etc.)
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
        let fileType = messageContent.type || 'image';  // Par défaut, on envoie des images, mais on peut spécifier "audio"

        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: fileType,  // "image", "audio", etc.
                    payload: {
                        url: messageContent.files[0],  // Envoi du premier fichier
                        is_reusable: true  // Optionnel, permet au fichier d'être réutilisé
                    }
                }
            }
        };
    } else {
        console.error('Contenu du message non valide.');
        return;
    }

    // Envoyer la requête POST à l'API Messenger
    axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Message envoyé avec succès:', response.data);
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi du message:', error.response ? error.response.data : error.message);
        });
};

module.exports = sendMessage;

