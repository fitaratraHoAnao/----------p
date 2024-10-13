const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si l'utilisateur a demandé une page ou des paroles
        const isPageRequest = /^\d+$/.test(prompt.trim()); // Vérifie si le prompt est un nombre

        let reply;

        if (isPageRequest) {
            // Si l'utilisateur demande une page, récupérer les chansons de cette page
            const page = parseInt(prompt.trim(), 10);
            const songsApiUrl = `https://tononkira.onrender.com/hira/rehetra?page=${page}`;

            const songsResponse = await axios.get(songsApiUrl);
            reply = songsResponse.data; // Obtenir les données JSON des chansons

            // Formater la réponse pour l'utilisateur
            reply = `Voici les chansons de la page ${page} :\n` + 
                    songsResponse.data.songs.map(song => `- ${song.title} par ${song.artist}`).join('\n');
        } else {
            // Si l'utilisateur a entré un titre et un artiste, extraire les informations
            const [title, artist] = prompt.split(' ').slice(-2); // On prend les deux derniers mots comme titre et artiste

            const lyricsApiUrl = `https://tononkira.onrender.com/parole?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
            const lyricsResponse = await axios.get(lyricsApiUrl);
            reply = lyricsResponse.data; // Obtenir les données JSON des paroles

            // Formater la réponse pour l'utilisateur
            reply = `Paroles de "${title}" par "${artist}" :\n${reply.lyrics}`;
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tononkira",  // Le nom de la commande
    description: "Permet de rechercher des chansons ou des paroles.",  // Description de la commande
    usage: "Envoyez 'tononkira <numéro de page>' pour obtenir les chansons ou 'tononkira <titre> <artiste>' pour les paroles."  // Comment utiliser la commande
};
