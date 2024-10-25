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

            // Vérification et journalisation de la réponse de l'API
            console.log('Réponse de l\'API:', response.data);

            // Récupérer la liste des poèmes (titre, auteur, URL audio)
            const poemeList = response.data;

            // Boucle pour envoyer chaque poème un par un avec son audio
            for (let i = 0; i < poemeList.length; i++) {
                const poeme = poemeList[i];

                // Envoyer le titre, l'auteur et l'audio
                await envoyerPoeme(senderId, poeme);
                
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

// Fonction pour envoyer le titre, l'auteur et l'audio
const envoyerPoeme = async (senderId, poeme) => {
    try {
        // Envoyer le titre
        const titreMessage = `Titre: ${poeme.title}`;
        await sendMessage(senderId, titreMessage);

        // Attendre que le message du titre soit envoyé
        await new Promise(resolve => setTimeout(resolve, 1000)); // Optionnel, pour une meilleure expérience utilisateur

        // Envoyer l'auteur
        const auteurMessage = `Auteur: ${poeme.author}`;
        await sendMessage(senderId, auteurMessage);

        // Attendre que le message de l'auteur soit envoyé
        await new Promise(resolve => setTimeout(resolve, 1000)); // Optionnel, pour une meilleure expérience utilisateur

        // Envoyer l'audio sous forme de fichier MP3
        const audioUrl = poeme.audio_url;
        const audioMessage = {
            attachment: {
                type: 'audio',
                payload: {
                    url: audioUrl, // URL de l'audio récupérée de l'API
                }
            }
        };

        // Envoyer l'audio MP3 à l'utilisateur
        await sendMessage(senderId, audioMessage);

        console.log(`Audio envoyé pour ${poeme.title} par ${poeme.author}`);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'audio:', error);

        // Envoyer un message d'erreur en cas de problème avec l'envoi de l'audio
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de l'envoi de l'audio.");
    }
};
