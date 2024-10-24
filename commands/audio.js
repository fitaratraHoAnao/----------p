const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Si le prompt est 'audio', récupérer les audios de l'API Vercel
        if (prompt.toLowerCase() === 'audio') {
            // Envoyer un message de confirmation que le message a été reçu
            await sendMessage(senderId, "Préparation des audios, veuillez patienter...");

            // Appeler l'API Vercel pour obtenir la liste des audios (page 1 par défaut)
            const apiUrl = `https://audio-tononkalo.vercel.app/recherche?question=audio&page=1`;
            const response = await axios.get(apiUrl);

            // Récupérer la liste des poèmes (titre, auteur, URL audio)
            const poemeList = response.data;

            // Boucle pour envoyer chaque poème un par un avec son audio
            for (let i = 0; i < poemeList.length; i++) {
                const poeme = poemeList[i];

                // Envoyer le titre et l'auteur
                const message = `Titre: ${poeme.title}\nAuteur: ${poeme.author}`;
                await sendMessage(senderId, message);

                // Attendre 2 secondes entre chaque envoi pour éviter la surcharge
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Envoyer l'audio sous forme de fichier MP3
                const audioUrl = poeme.audio_url;
                const audioMessage = {
                    attachment: {
                        type: 'audio',
                        payload: {
                            url: audioUrl,
                        }
                    }
                };

                // Envoyer l'audio MP3 à l'utilisateur
                await sendMessage(senderId, audioMessage);

                // Attendre 2 secondes avant d'envoyer le prochain poème
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } else {
            // Si ce n'est pas une demande d'audio, informer l'utilisateur
            await sendMessage(senderId, "Veuillez envoyer 'audio' pour obtenir les poèmes.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API audio:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande d'audio.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "audio",  // Le nom de la commande
    description: "Permet d'écouter les poèmes avec l'audio.",  // Description de la commande
    usage: "Envoyez 'audio' pour obtenir la liste des poèmes avec leurs audios."  // Comment utiliser la commande
};
