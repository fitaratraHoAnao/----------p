const axios = require("axios");
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = {
  config: {
    name: "youtube",
    author: "Jun",
    countDown: 10,
    role: 0,
    category: "media"
  },

  info: {
    usage: "youtube <music ou video> <titre>",
    description: "Recherche des vidéos sur YouTube et permet de télécharger l'audio d'une vidéo choisie.",
    example: "youtube music metamorphosis"
  },

  execute: async function (senderId, prompt) {
    try {
      // Envoyer un message de confirmation que le message a été reçu
      await sendMessage(senderId, "Message reçu, je prépare une réponse...");

      const args = prompt.split(' ');
      const type = args[0]?.toLowerCase();

      // Validation du type
      if (!type || !['music', 'video'].includes(type)) {
        return await sendMessage(senderId, `Usage invalide. Veuillez utiliser : ${this.info.usage}`);
      }

      const title = args.slice(1).join(" ");
      if (!title) return await sendMessage(senderId, "Veuillez ajouter un titre.");

      // Appel à l'API de recherche YouTube
      const { data: searchData } = await axios.get(`https://api-improve-production.up.railway.app/yt/search?q=${encodeURIComponent(title)}`);
      const videos = searchData.videos.slice(0, 6);

      // Vérifier s'il y a des vidéos trouvées
      if (videos.length === 0) {
        return await sendMessage(senderId, "Aucune vidéo trouvée. Veuillez essayer avec un autre titre.");
      }

      // Construire le message avec les vidéos disponibles
      const videoListMessage = videos.map((vid, i) => `${i + 1}. ${vid.title}\nDurée: ${vid.duration}\n`).join("\n") + "\nVeuillez choisir une vidéo en répondant avec un numéro de 1 à 6.";

      // Envoyer le message avec les titres des vidéos
      const { messageID } = await sendMessage(senderId, videoListMessage, {
        attachment: await Promise.all(videos.map(video => global.utils.getStreamFromURL(video.thumb)))
      });

      // Stocker la réponse pour le traitement ultérieur
      global.GoatBot.onReply.set(messageID, {
        commandName: this.config.name,
        messageID,
        videos,
        type,
        sender: senderId
      });
    } catch (error) {
      console.error('Erreur lors de la recherche YouTube :', error);
      await sendMessage(senderId, error.response?.data?.error || error.message);
    }
  },

  handleVideoDownload: async function (senderId, videoIndex, videos) {
    try {
      const video = videos[videoIndex - 1];
      if (!video) return await sendMessage(senderId, "Vidéo non trouvée.");

      // Télécharger l'audio de la vidéo choisie
      const { data: downloadData } = await axios.get(`https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(video.url)}&format=mp3`);
      
      // Envoyer le fichier audio à l'utilisateur
      await sendMessage(senderId, "Voici votre audio :", { attachment: downloadData });
    } catch (error) {
      console.error('Erreur lors du téléchargement de la vidéo :', error);
      await sendMessage(senderId, error.response?.data?.error || error.message);
    }
  }
};
