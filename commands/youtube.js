const axios = require("axios");
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Un tableau pour stocker les choix des utilisateurs
const userChoices = new Map();

module.exports = async (senderId, args) => {
    try {
        const type = args[0]?.toLowerCase();
        if (!type || !['music', 'video'].includes(type)) {
            return sendMessage(senderId, `Usage invalide. Utilisez: ytb music ou video <title>\n\nExemple: ytb music metamorphosis`);
        }

        const title = args.slice(1).join(" ");
        if (!title) return sendMessage(senderId, "Veuillez ajouter un titre");

        // Appeler l'API pour obtenir les vidéos
        const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${title}`);
        const videos = data.videos.slice(0, 6);
        
        // Préparer le message avec les titres des vidéos
        const videoList = videos.map((vid, i) => `${i + 1}. ${vid.title}\nDurée: ${vid.duration}\n`).join("\n");
        const replyMessage = `${videoList}\nVeuillez choisir une vidéo en répondant avec un numéro de 1 à 6.`;
        
        // Envoyer la liste des vidéos à l'utilisateur
        const messageResponse = await sendMessage(senderId, replyMessage);

        // Stocker le choix de l'utilisateur temporairement
        userChoices.set(senderId, { videos, type, messageID: messageResponse.messageID });

    } catch (error) {
        console.error('Erreur:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Fonction pour gérer les réponses des utilisateurs
module.exports.handleReply = async (senderId, userResponse) => {
    const userChoice = userChoices.get(senderId);
    if (!userChoice) return;

    const { videos, type, messageID } = userChoice;
    const choice = parseInt(userResponse, 10);

    if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return sendMessage(senderId, "Veuillez répondre par un numéro entre 1 et 6 uniquement.");
    }

    const { url, title, duration } = videos[choice - 1];
    const { data: { url: link } } = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${url}&type=${type}`);

    // Supprimer le message précédent
    await sendMessage(senderId, {
        body: `${title} (${duration})`,
        attachment: await global.utils.getStreamFromURL(link)
    });

    // Retirer l'utilisateur de la liste des choix
    userChoices.delete(senderId);
};

// Informations sur la commande
module.exports.info = {
    name: "ytb",  // Le nom de la commande
    description: "Permet de rechercher des vidéos sur YouTube.",  // Description de la commande
    usage: "Envoyez 'ytb music <titre>' ou 'ytb video <titre>' pour rechercher une vidéo."  // Comment utiliser la commande
};
