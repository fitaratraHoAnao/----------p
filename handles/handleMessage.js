const sendMessage = require('./sendMessage');
const axios = require('axios');

const handleMessage = async (event) => {
    const senderId = event.sender.id;
    const message = event.message;

    // Message d'attente
    const typingMessage = "🇲🇬 *Bruno* rédige sa réponse... un instant, s'il vous plaît 🍟";
    await sendMessage(senderId, typingMessage); // Envoyer le message d'attente

    // Ajouter un délai de 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Vérifier si l'utilisateur a envoyé une image
    if (message.attachments && message.attachments[0].type === 'image') {
        const imageUrl = message.attachments[0].payload.url;

        // Appeler l'API Flask avec l'image
        const prompt = "Veuillez analyser l'image et continuer la conversation.";
        const customId = senderId;

        try {
            const response = await axios.post('https://gemini-ap-espa-bruno.onrender.com/api/gemini', {
                prompt,
                customId,
                link: imageUrl
            });
            const reply = response.data.message;

            // Envoyer la réponse au user
            sendMessage(senderId, reply);
        } catch (error) {
            console.error('Error calling the API:', error);
            sendMessage(senderId, 'Sorry, something went wrong when processing the image.');
        }
    } 
    // Si c'est un message texte, continuer la conversation
    else if (message.text) {
        const prompt = message.text;
        const customId = senderId;

        try {
            const response = await axios.post('https://gemini-ap-espa-bruno.onrender.com/api/gemini', {
                prompt,
                customId
            });
            const reply = response.data.message;

            // Envoyer la réponse au user
            sendMessage(senderId, reply);
        } catch (error) {
            console.error('Error calling the API:', error);
            sendMessage(senderId, 'Sorry, something went wrong when processing your message.');
        }
    }
};

module.exports = handleMessage;
