const fs = require("fs-extra");
const ytdl = require("@neoxr/ytdl-core");
const yts = require("yt-search");
const axios = require('axios');
const tinyurl = require('tinyurl');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, message) => {
  try {
    let song;
    let lyrics;

    // Si le message est une réponse à un média (audio ou vidéo)
    if (message.type === "message_reply" && ["audio", "video"].includes(message.messageReply.attachments[0].type)) {
      const attachmentUrl = message.messageReply.attachments[0].url;
      const urls = await tinyurl.shorten(attachmentUrl) || message.body.split(' ').join(' ');
      const response = await axios.get(`https://www.api.vyturex.com/songr?url=${urls}`); // API pour obtenir les infos de la chanson

      if (response.data && response.data.title) {
        song = response.data.title;
        lyrics = await getLyrics(song); // Obtenir les paroles
      } else {
        return message.reply("Error: Song information not found.");
      }
    } else {
      // Si le message contient un titre de chanson
      const input = message.body;
      const text = input.substring(12);
      const data = input.split(" ");

      if (data.length < 2) {
        return message.reply("Please include music title");
      }

      data.shift();
      song = data.join(" ");
      lyrics = await getLyrics(song); // Obtenir les paroles
    }

    // Si les paroles n'ont pas été trouvées
    if (!lyrics) {
      return message.reply("Error: Lyrics not found.");
    }

    // Répondre à l'utilisateur pour lui indiquer que la chanson est en cours de lecture
    const originalMessage = await message.reply(`playing lyrics for "${song}"...`);
    const searchResults = await yts(song); // Rechercher la chanson sur YouTube

    // Si la chanson n'est pas trouvée
    if (!searchResults.videos.length) {
      return message.reply("Error: Song not found.");
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioonly" }); // Télécharger l'audio de la vidéo
    const fileName = `music.mp3`;
    const filePath = `${__dirname}/tmp/${fileName}`;

    // Télécharger la chanson
    stream.pipe(fs.createWriteStream(filePath));

    stream.on('response', () => {
      console.info('[DOWNLOADER]', 'Starting download now!');
    });

    stream.on('info', (info) => {
      console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
    });

    stream.on('end', async () => {
      console.info('[DOWNLOADER] Downloaded');
      
      // Vérifier si le fichier est trop gros (plus de 83 MB)
      if (fs.statSync(filePath).size > 87380608) {
        fs.unlinkSync(filePath);
        return message.reply('[ERR] The file could not be sent because it is larger than 83mb.');
      }

      // Préparer le message avec le fichier audio et les paroles
      const replyMessage = {
        body: `Title: ${video.title}\nArtist: ${video.author.name}\n\nLyrics:\n${lyrics}`,
        attachment: fs.createReadStream(filePath),
      };

      await api.unsendMessage(originalMessage.messageID); // Annuler le message original
      await message.reply(replyMessage, event.threadID, () => {
        fs.unlinkSync(filePath); // Supprimer le fichier après l'envoi
      });
    });

  } catch (error) {
    console.error('[ERROR]', error);
    message.reply("This song is not available.");
  }
};

// Fonction pour récupérer les paroles de la chanson
async function getLyrics(song) {
  try {
    const response = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(song)}`);
    if (response.data && response.data.lyrics) {
      return response.data.lyrics;
    } else {
      return null;
    }
  } catch (error) {
    console.error('[LYRICS ERROR]', error);
    return null;
  }
}

// Informations de la commande
module.exports.info = {
  name: "lyrics",  // Nom de la commande
  description: "Obtenez les paroles d'une chanson en envoyant son titre.",  // Description de la commande
  usage: "Envoyez 'lyrics <nom de la chanson>' pour obtenir les paroles de la chanson."  // Comment utiliser la commande
};
