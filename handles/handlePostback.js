const sendMessage = require('./sendMessage');

const handlePostback = (event) => {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    // Traitement de diff茅rents types de postbacks
    if (payload === 'GET_STARTED') {
        sendMessage(senderId, "Welcome! Please send me an image to start.");
    } else {
        sendMessage(senderId, "馃嚥馃嚞 Salut, je m'appelle Bruno ! Je suis l脿 pour r茅pondre 脿 toutes vos questions. Comment puis-je vous aider aujourd'hui ? 鉁�");
    }
};

module.exports = handlePostback;
