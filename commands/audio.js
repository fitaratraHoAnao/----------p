const sendMessage = require('../handles/sendMessage');
const axios = require('axios');

const downloadAudio = async (senderId, videoUrl) => {
    try {
        const apiUrl = `https://joncll.serv00.net/yt.php?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.success) {
            const downloadLink = response.data.data.downloadLink.url;
            const title = response.data.title;

            // Forcer le lien de téléchargement
            const downloadMessage = `🎶 Voici l'audio de "${title}" :\nCliquez ici pour télécharger : [Télécharger](${downloadLink})`;
            await sendMessage(senderId, downloadMessage);
        } else {
            await sendMessage(senderId, "Désolé, je n'ai pas pu récupérer l'audio de cette vidéo.");
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'audio :', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du téléchargement de l'audio.");
    }
};

module.exports = downloadAudio;
          
