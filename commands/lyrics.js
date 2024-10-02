const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom de la chanson à partir du texte de l'utilisateur
    const songName = userText.slice(3).trim();

    // Vérifier si le nom de la chanson est vide
    if (!songName) {
        await sendMessage(senderId, 'Veuillez fournir le nom de la chanson pour que je puisse trouver les paroles.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Recherche des paroles en cours...");

        // Appeler l'API Lyricist pour récupérer les paroles de la chanson
        const apiUrl = `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`;
        const response = await axios.get(apiUrl);

        // Afficher la réponse brute pour déboguer
        console.log('Réponse de l\'API:', response.data);

        // Vérifier si les données sont présentes dans la réponse
        const lyrics = response.data.lyrics;
        const title = response.data.title;
        const artist = response.data.artist;
        const imageUrl = response.data.image;

        // Si les données ne sont pas trouvées, envoyer un message d'erreur
        if (!title || !artist || !lyrics) {
            await sendMessage(senderId, "Désolé, je n'ai pas trouvé les paroles de cette chanson.");
            return;
        }

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Créer le message à envoyer avec les paroles
        const message = `**Paroles de "${title}" par ${artist}:**\n\n${lyrics}`;

        // Si l'image de l'album existe, l'ajouter à la réponse
        if (imageUrl) {
            await sendMessage(senderId, message);
            await sendMessage(senderId, { attachment: imageUrl });
        } else {
            await sendMessage(senderId, message);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Lyricist:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la recherche des paroles.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "lyrics",  // Le nom de la commande
    description: "Envoyer le nom d'une chanson pour obtenir ses paroles.",  // Description de la commande
    usage: "Envoyez 'lyrics <nom de la chanson>' pour obtenir les paroles."  // Comment utiliser la commande
};
