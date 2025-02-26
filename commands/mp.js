const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si l'utilisateur a demandé une page ou un titre
        const isPageRequest = /^\d+$/.test(prompt.trim()); // Vérifie si le prompt est un nombre

        let reply;

        if (isPageRequest) {
            // Si l'utilisateur demande une page, récupérer les chansons de cette page
            const page = parseInt(prompt.trim(), 10);
            const songsApiUrl = `https://api-test-airgw2lbg-bruno-rakotomalalas-projects-7bc48188.vercel.app/audio?tononkalo=audio&page=${page}`;

            const songsResponse = await axios.get(songsApiUrl);
            
            // Construire une réponse formatée pour les chansons
            reply = `Voici les chansons de la page ${page} :\n`;
            
            for (const song of songsResponse.data.results) {
                // Envoyer successivement : Titre, Auteur
                await sendMessage(senderId, `Titre : ${song.titre}`);
                await sendMessage(senderId, `Auteur : ${song.auteur}`);
                
                // Attendre 2 secondes avant d'envoyer l'audio
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Envoyer le fichier audio en pièce jointe
                await sendMessage(senderId, { attachment: { type: 'audio', payload: { url: song.audio } } });

                // Attendre 2 secondes avant d'envoyer la chanson suivante
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } else {
            // Si l'utilisateur a entré un titre et un artiste
            const parts = prompt.split(' ');
            const title = parts.slice(0, parts.length - 1).join(' '); // Tous sauf le dernier mot comme titre
            const artist = parts[parts.length - 1]; // Le dernier mot comme artiste
            
            // Créer l'URL pour les paroles
            const lyricsApiUrl = `https://parol.vercel.app/parole?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`;
            console.log(`Appel à l'API pour les paroles : ${lyricsApiUrl}`); // Afficher l'URL pour déboguer
            
            const lyricsResponse = await axios.get(lyricsApiUrl);
            reply = lyricsResponse.data; // Obtenir les données JSON des paroles

            // Formater la réponse pour l'utilisateur
            reply = `Paroles de "${title}" par "${artist}" :\n${reply.lyrics.replace(/\\n/g, '\n')}`; // Remplacer les \n par de véritables sauts de ligne

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer la réponse de l'API à l'utilisateur
            await sendMessage(senderId, reply);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mp",  // Nouveau nom de la commande
    description: "Permet de rechercher des chansons audio par page et d'envoyer des fichiers audio en pièce jointe.",  // Nouvelle description
    usage: "Envoyez 'mp <numéro de page>' pour obtenir une liste de chansons avec leurs fichiers audio en pièce jointe."  // Nouveau format d'usage
};
