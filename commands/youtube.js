const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText, event) => {
    // Extraire le prompt en retirant le préfixe 'ai' et en supprimant les espaces superflus
    const pr = await global.utils.getPrefix(event.threadID) + this.config.name;
    const args = userText.split(" "); // Extraire les arguments

    try {
        const type = args[0]?.toLowerCase();
        if (!type || !['music'].includes(type)) { // Limiter à la recherche de musique
            return message.reply(`Utilisation invalide. Veuillez utiliser : ${pr} music <titre>\n\nexemple : ${pr} music metamorphosis`);
        }

        const title = args.slice(1).join(" ");
        if (!title) return message.reply("Veuillez ajouter un titre.");

        const { data } = await axios.get(`https://apiv3-2l3o.onrender.com/yts?title=${title}`);
        const videos = data.videos.slice(0, 6);
        
        if (videos.length === 0) {
            return message.reply("Aucune vidéo trouvée pour ce titre.");
        }

        // Envoyer la liste des vidéos
        const { messageID } = await message.reply({
            body: videos.map((vid, i) => `${i + 1}. ${vid.title}\nDurée: ${vid.duration}\n`).join("\n") + "\nVeuillez choisir un numéro de vidéo en répondant 1 à 6.",
            attachment: await Promise.all(videos.map(video => global.utils.getStreamFromURL(video.thumb)))
        });

        // Enregistrer la réponse du message pour le traitement ultérieur
        global.GoatBot.onReply.set(messageID, {
            commandName: this.config.name,
            messageID,
            videos,
            type,
            sender: event.senderID
        });

    } catch (error) {
        message.reply(error.response?.data?.error || error.message);
    }
};

// Gestion de la réponse de l'utilisateur
global.GoatBot.onReply.set(messageID, async (event) => {
    const { videos, sender, messageID, type } = Reply;
    if (event.senderID !== sender) return;

    const choice = parseInt(event.body, 10);
    if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return message.reply("Veuillez répondre avec un numéro entre 1 et 6 uniquement.");
    }

    const { url, title, duration } = videos[choice - 1];
    const { data: { url: link } } = await axios.get(`https://apiv3-2l3o.onrender.com/ytb?link=${url}&type=${type}`);

    message.unsend(messageID);
    message.reply({
        body: `${title} (${duration})`,
        attachment: await global.utils.getStreamFromURL(link)
    });
});
// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "commande pour chercher de vidéo sur YouTube.",  // Description de la commande
    usage: "Envoyez 'youtube <votre research>' pour obtenir une réponse."  // Comment utiliser la commande
};
