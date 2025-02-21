const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

let userSessions = {}; // Stocker les artistes et les chansons en cours

module.exports = async (senderId, prompt) => { 
    try {
        await sendMessage(senderId, "🎵 Un instant... Je cherche les chansons ! 🎶⌛");

        const [command, ...args] = prompt.split(" ");
        const searchTerm = args.join(" ");

        if (!searchTerm) {
            return await sendMessage(senderId, "❌ Veuillez spécifier un artiste. Exemple : `hira Ambondrona`");
        }

        if (!userSessions[senderId]) {
            // Étape 1 : Récupérer la liste des chansons de l'artiste
            const apiUrl = `https://api-test-one-brown.vercel.app/mpanakanto?anarana=${encodeURIComponent(searchTerm)}`;
            const response = await axios.get(apiUrl);

            const { sary, [`hiran'i ${searchTerm}`]: songs } = response.data;

            if (!songs || songs.length === 0) {
                return await sendMessage(senderId, "❌ Aucune chanson trouvée pour cet artiste !");
            }

            let songList = songs.map((song, index) => `${index + 1}- ${song}`).join("\n");

            await sendMessage(senderId, `🎶 Voici les chansons de *${searchTerm}* :\n\n${songList}`);

            // Envoyer l'image en pièce jointe
            await sendMessage(senderId, { attachment: { type: "image", payload: { url: sary } } });

            // Sauvegarder la session utilisateur
            userSessions[senderId] = { artist: searchTerm, songs };

        } else {
            // Étape 2 : L'utilisateur a envoyé un numéro -> récupérer les paroles et le MP3
            const songIndex = parseInt(searchTerm) - 1;
            const { artist, songs } = userSessions[senderId];

            if (isNaN(songIndex) || songIndex < 0 || songIndex >= songs.length) {
                return await sendMessage(senderId, "❌ Numéro invalide. Réessayez avec un numéro de la liste !");
            }

            const selectedSong = songs[songIndex];
            const lyricsUrl = `https://api-test-one-brown.vercel.app/parole?mpihira=${encodeURIComponent(artist)}&titre=${encodeURIComponent(selectedSong)}`;
            const lyricsResponse = await axios.get(lyricsUrl);
            
            const { titre, paroles, mp3 } = lyricsResponse.data;
            const lyricsText = paroles.join("\n");

            await sendMessage(senderId, `✅ *Titre* : ${titre}\n🇲🇬 *Paroles* 👉\n${lyricsText}`);
            await sendMessage(senderId, { attachment: { type: "audio", payload: { url: mp3 } } });

            // Supprimer la session après envoi des paroles et MP3
            delete userSessions[senderId];
        }

    } catch (error) {
        console.error("Erreur API:", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue. Réessaie plus tard !");
    }
};

module.exports.info = {
    name: "hira",
    description: "Obtiens la liste des chansons d'un artiste et écoute leurs paroles.",
    usage: "Envoyez 'hira <nom de l'artiste>' pour voir la liste des chansons.\nPuis, envoyez un numéro pour voir les paroles et écouter la chanson."
};
