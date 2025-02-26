const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si l'utilisateur a demandé une page
        const isPageRequest = /^\d+$/.test(prompt.trim()); 

        if (isPageRequest) {
            const page = parseInt(prompt.trim(), 10);
            const songsApiUrl = `https://api-test-airgw2lbg-bruno-rakotomalalas-projects-7bc48188.vercel.app/audio?tononkalo=audio&page=${page}`;

            const songsResponse = await axios.get(songsApiUrl);
            const songs = songsResponse.data.results;

            if (songs.length === 0) {
                await sendMessage(senderId, "Aucune chanson trouvée pour cette page.");
                return;
            }

            await sendMessage(senderId, `Voici ${Math.min(5, songs.length)} chansons de la page ${page} :`);

            for (let i = 0; i < songs.length; i++) {
                const song = songs[i];

                // Envoyer Titre et Auteur avec un délai
                await sendMessage(senderId, `🎵 *Titre* : ${song.titre}\n✍️ *Auteur* : ${song.auteur}`);
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Envoyer l'audio
                await sendMessage(senderId, { attachment: { type: 'audio', payload: { url: song.audio } } });
                await new Promise(resolve => setTimeout(resolve, 4000)); // Pause pour éviter le spam

                // Message de confirmation
                await sendMessage(senderId, `✅ Chanson ${i + 1}/${songs.length} envoyée.`);

                // Limiter à 5 chansons pour éviter la restriction Messenger
                if (i >= 4) {
                    await sendMessage(senderId, "🔹 Pour recevoir plus de chansons, veuillez envoyer à nouveau la commande avec la page souhaitée.");
                    break;
                }
            }
        } else {
            await sendMessage(senderId, "Veuillez entrer un numéro de page valide pour recevoir des chansons.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite.");
    }
};

module.exports.info = {
    name: "audio",
    description: "Envoie des chansons avec audio en pièce jointe.",
    usage: "Envoyez 'audio <numéro de page>' pour obtenir des chansons avec fichiers audio."
};
