const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

let userSessions = {}; // Stocke les sessions des utilisateurs

module.exports = async (senderId, prompt) => { 
    try {
        const [command, ...args] = prompt.split(" ");
        const userInput = args.join(" ").trim();

        if (!userInput) {
            return await sendMessage(senderId, "❌ Veuillez spécifier un artiste. Exemple : `hira Ambondrona`");
        }

        // Vérifie si l'utilisateur envoie un **nombre**
        if (/^\d+$/.test(userInput)) {
            const songIndex = parseInt(userInput) - 1;
            
            // Vérifie si l'utilisateur a déjà fait une recherche
            if (!userSessions[senderId]) {
                return await sendMessage(senderId, "❌ Vous devez d'abord rechercher un artiste ! Exemple : `hira Ambondrona`");
            }

            const { artist, songs } = userSessions[senderId];

            // Vérifie si le numéro est valide
            if (songIndex < 0 || songIndex >= songs.length) {
                return await sendMessage(senderId, "❌ Numéro invalide. Réessayez avec un numéro de la liste !");
            }

            const selectedSong = songs[songIndex];

            // Récupérer les paroles et le MP3
            const lyricsUrl = `https://api-test-one-brown.vercel.app/parole?mpihira=${encodeURIComponent(artist)}&titre=${encodeURIComponent(selectedSong)}`;
            const lyricsResponse = await axios.get(lyricsUrl);
            
            const { titre, paroles, mp3 } = lyricsResponse.data;
            const lyricsText = paroles.join("\n");

            await sendMessage(senderId, `✅ *Titre* : ${titre} (${artist})\n🇲🇬 *Paroles* 👉\n${lyricsText}`);
            await sendMessage(senderId, { attachment: { type: "audio", payload: { url: mp3 } } });

            // Laisse la session ouverte pour d'autres sélections
            return;
        }

        // L'utilisateur a tapé un artiste, donc on recherche les chansons
        await sendMessage(senderId, "🎵 Un instant... Je cherche les chansons ! 🎶⌛");

        const apiUrl = `https://api-test-one-brown.vercel.app/mpanakanto?anarana=${encodeURIComponent(userInput)}`;
        const response = await axios.get(apiUrl);

        const { sary, [`hiran'i ${userInput}`]: songs } = response.data;

        if (!songs || songs.length === 0) {
            return await sendMessage(senderId, "❌ Aucune chanson trouvée pour cet artiste !");
        }

        let songList = songs.map((song, index) => `${index + 1}- ${song}`).join("\n");

        await sendMessage(senderId, `🎶 Voici les chansons de *${userInput}* :\n\n${songList}`);
        await sendMessage(senderId, { attachment: { type: "image", payload: { url: sary } } });

        // Sauvegarde l'artiste et la liste des chansons
        userSessions[senderId] = { artist: userInput, songs };

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
