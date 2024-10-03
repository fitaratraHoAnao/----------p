const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const sendJoke = async (senderId) => {
    try {
        const apiUrl = 'https://v2.jokeapi.dev/joke/Any';
        const response = await axios.get(apiUrl);
        const jokeData = response.data; // Récupérer les données de la blague

        // Vérifier le type de blague ("twopart" ou "single")
        if (jokeData.type === 'twopart') {
            // Blague à deux parties : setup et delivery
            await sendMessage(senderId, `Blague: ${jokeData.setup}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Pause de 2 secondes pour l'effet comique
            await sendMessage(senderId, `Réponse: ${jokeData.delivery}`);
        } else if (jokeData.type === 'single') {
            // Blague simple (une seule ligne)
            await sendMessage(senderId, `Blague: ${jokeData.joke}`);
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API JokeAPI:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération d'une blague.");
    }
};

module.exports = async (senderId, userText) => {
    // Vérifier si la commande est 'joke'
    if (userText.trim().toLowerCase() === 'joke') {
        await sendMessage(senderId, 'Je cherche une blague pour vous...');
        await sendJoke(senderId); // Appel de la fonction pour envoyer une blague
    } else {
        await sendMessage(senderId, 'Veuillez utiliser la commande "joke" pour demander une blague.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "joke",  // Le nom de la commande
    description: "Demandez une blague aléatoire avec la commande 'joke'.",  // Description de la commande
    usage: "Envoyez 'joke' pour obtenir une blague."  // Comment utiliser la commande
};
