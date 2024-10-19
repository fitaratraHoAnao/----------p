const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si l'utilisateur a une session active
        if (!userSessions[senderId]) {
            userSessions[senderId] = {
                apiChoice: null,
                params: null,
            };
        }

        // Extraire les paramètres
        const params = prompt.split(' ');
        const command = params[0];
        const param1 = params[1]; // Peut être le tononkalo ou le numéro de page
        const param2 = params[2]; // Utilisé pour les titres ou d'autres paramètres

        // Gestion des choix d'API
        if (command === 'tononkalo') {
            const apiNumber = parseInt(param1);
            if (apiNumber === 1) {
                userSessions[senderId].apiChoice = 1;
                await sendMessage(senderId, "Vous avez autorisé à utiliser l'API 1.\nVoilà son utilisation : `aorn 1`.");
            } else if (apiNumber === 2) {
                userSessions[senderId].apiChoice = 2;
                await sendMessage(senderId, "Vous avez autorisé à utiliser l'API 2.\nVoilà son utilisation : `aorn HIANOKA`.");
            } else if (apiNumber === 3) {
                userSessions[senderId].apiChoice = 3;
                await sendMessage(senderId, "Vous avez autorisé à utiliser l'API 3.\nVoilà son utilisation : `mpanoratra 1`.");
            } else if (apiNumber === 4) {
                userSessions[senderId].apiChoice = 4;
                await sendMessage(senderId, "Vous avez autorisé à utiliser l'API 4.\nVoilà son utilisation : `aorn 1`.");
            } else {
                await sendMessage(senderId, "API non reconnue. Veuillez spécifier un numéro d'API valide (1-4).");
                return;
            }
        } else {
            // Vérifier quelle API l'utilisateur a choisi
            const apiChoice = userSessions[senderId].apiChoice;
            if (!apiChoice) {
                await sendMessage(senderId, "Veuillez d'abord choisir une API en utilisant `tononkalo <numéro>`.");
                return;
            }

            let apiUrl;
            let response;

            if (apiChoice === 1) {
                const tononkalo = param1 || 'aorn';
                const page = param2 || 1;
                apiUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche?tononkalo=${encodeURIComponent(tononkalo)}&page=${encodeURIComponent(page)}`;
            } else if (apiChoice === 2) {
                const auteur = param1 || 'aorn';
                const titre = param2 || 'HIANOKA';
                apiUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche_auteur?auteur=${encodeURIComponent(auteur)}&titre=${encodeURIComponent(titre)}`;
            } else if (apiChoice === 3) {
                const query = param1 || 'mpanoratra';
                const page = param2 || 1;
                apiUrl = `https://manoratra-liste-tononkalo.vercel.app/auteur?query=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`;
            } else if (apiChoice === 4) {
                const poeme = param1 || 'aorn';
                const page = param2 || 1;
                apiUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche_poeme?poeme=${encodeURIComponent(poeme)}&page=${encodeURIComponent(page)}`;
            }

            // Appel à l'API
            response = await axios.get(apiUrl);

            // Récupérer la réponse
            const reply = response.data;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer la réponse de l'API à l'utilisateur
            await sendMessage(senderId, JSON.stringify(reply, null, 2));
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tononkalo",  // Le nom de la commande
    description: "Recherchez des poèmes par tononkalo et pagination.",  // Nouvelle description
    usage: "Envoyez 'tononkalo <numéro>' pour choisir une API, puis utilisez 'aorn <paramètres>' pour faire une recherche."  // Nouvelle façon d'utiliser la commande
};
