const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const { getStreamFromURL, randomString } = global.utils;

let autoLinkStates = loadAutoLinkStates();

function loadAutoLinkStates() {
  try {
    const data = fs.readFileSync("autolink.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveAutoLinkStates(states) {
  fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

// Fonction pour raccourcir l'URL
async function shortenURL(url) {
  try {
    const response = await axios.get(`https://shortner-sepia.vercel.app/kshitiz?url=${encodeURIComponent(url)}`);
    return response.data.shortened;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to shorten URL");
  }
}

// Fonction principale appelée à chaque message reçu
module.exports = async (senderId, prompt, { api, event }) => {
  const threadID = event.threadID;
  
  // Activation / Désactivation du téléchargement automatique
  if (event.body.toLowerCase().includes('autolink off')) {
    autoLinkStates[threadID] = 'off';
    saveAutoLinkStates(autoLinkStates);
    return api.sendMessage("AutoLink is now turned off for this chat.", event.threadID, event.messageID);
  } 
  
  if (event.body.toLowerCase().includes('autolink on')) {
    autoLinkStates[threadID] = 'on';
    saveAutoLinkStates(autoLinkStates);
    return api.sendMessage("AutoLink is now turned on for this chat.", event.threadID, event.messageID);
  }

  // Vérifier si une URL valide a été envoyée
  const url = checkLink(event.body);
  if (url && autoLinkStates[threadID] !== 'off') {
    return downloadAndSendVideo(url, api, event);
  } else if (url) {
    return api.sendMessage("AutoLink is turned off. Please enable it to download videos.", event.threadID, event.messageID);
  }
};

// Fonction pour vérifier si l'URL est valide (Instagram, TikTok, etc.)
function checkLink(url) {
  if (url.includes("instagram") || url.includes("facebook") || url.includes("tiktok") || url.includes("youtube")) {
    return url;
  }
  return null;
}

// Fonction pour télécharger la vidéo et l'envoyer
async function downloadAndSendVideo(url, api, event) {
  const time = Date.now();
  const path = __dirname + `/cache/${time}.mp4`;

  try {
    let downloadUrl = '';

    // Identifier la plateforme et obtenir l'URL de téléchargement
    if (url.includes("instagram")) {
      downloadUrl = await getInstagramVideo(url);
    } else if (url.includes("tiktok")) {
      downloadUrl = await getTikTokVideo(url);
    } else if (url.includes("youtube")) {
      downloadUrl = await getYouTubeVideo(url);
    } else {
      return api.sendMessage("This platform is not supported for auto download.", event.threadID, event.messageID);
    }

    // Télécharger la vidéo
    const response = await axios({
      method: "GET",
      url: downloadUrl,
      responseType: "stream"
    });

    response.data.pipe(fs.createWriteStream(path));
    response.data.on('end', async () => {
      const shortUrl = await shortenURL(downloadUrl);
      const messageBody = `✅🔗 Download URL: ${shortUrl}`;

      // Envoyer la vidéo après téléchargement
      api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("Sorry, there was an error downloading the video.", event.threadID, event.messageID);
  }
}

// Exemple de fonction pour obtenir une vidéo d'Instagram
async function getInstagramVideo(url) {
  try {
    const res = await axios.get(`https://insta-kshitiz.vercel.app/insta?url=${encodeURIComponent(url)}`);
    return res.data.url;
  } catch (error) {
    throw new Error("Failed to retrieve Instagram video");
  }
}

// Exemple de fonction pour obtenir une vidéo de TikTok
async function getTikTokVideo(url) {
  try {
    const res = await axios.get(`https://tikdl-video.vercel.app/tiktok?url=${encodeURIComponent(url)}`);
    return res.data.videoUrl;
  } catch (error) {
    throw new Error("Failed to retrieve TikTok video");
  }
}

// Exemple de fonction pour obtenir une vidéo de YouTube
async function getYouTubeVideo(url) {
  try {
    const res = await axios.get(`https://yt-downloader-eta.vercel.app/kshitiz?url=${encodeURIComponent(url)}`);
    return res.data.url;
  } catch (error) {
    throw new Error("Failed to retrieve YouTube video");
  }
}

module.exports.info = {
  name: "autolink",  // Le nom de la commande
  description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
  usage: "Envoyez 'autolink <URL>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};
