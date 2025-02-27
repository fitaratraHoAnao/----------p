const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Variable pour stocker l'état de la recherche et la page actuelle pour chaque utilisateur
let userStates = {};

module.exports = async (senderId, prompt, uid) => {
    try {
        // Si l'utilisateur a envoyé un nombre, il souhaite la page suivante
        if (!isNaN(prompt)) {
            const page = parseInt(prompt);

            if (userStates[senderId] && userStates[senderId].query) {
                // Effectuer la requête pour la page demandée
                const response = await axios.get(`https://api-test-liart-alpha.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(userStates[senderId].query)}&page=${page}`);

                const data = response.data;
                if (data.results.length === 0) {
                    // Si aucun résultat trouvé, envoyer un message
                    await sendMessage(senderId, `❌ Aucun ohabolana trouvé pour ta recherche à la page ${page}.`);
                } else {
                    // Si la page contient des résultats, envoyer 10 par 10 dans un seul message
                    let messageBatch = '';
                    for (let i = 0; i < data.results.length; i++) {
                        messageBatch += `${data.results[i]}\n`; // Ajouter le résultat à un message
                        if ((i + 1) % 10 === 0 || i === data.results.length - 1) { // Si 10 résultats ou fin
                            await sendMessage(senderId, messageBatch); // Envoyer le message
                            messageBatch = ''; // Réinitialiser pour le prochain lot
                            // Attendre 2 secondes avant d'envoyer le prochain lot
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                    // Enregistrer l'état de la page pour la prochaine requête
                    userStates[senderId].currentPage = page;
                }
            } else {
                await sendMessage(senderId, "❌ Il n'y a pas de recherche en cours. Veuillez d'abord envoyer un mot clé.");
            }
        } else {
            // L'utilisateur a envoyé un mot pour la recherche "ohabolana"
            const query = prompt;

            // Sauvegarder l'état de la recherche et la première page
            userStates[senderId] = { query: query, currentPage: 1 };

            // Effectuer la requête pour la première page
            const response = await axios.get(`https://api-test-liart-alpha.vercel.app/fitadiavana?ohabolana=${encodeURIComponent(query)}&page=1`);
            
            const data = response.data;

            if (data.results.length === 0) {
                await sendMessage(senderId, `❌ Aucun ohabolana trouvé pour "${query}".`);
            } else {
                // Envoi des résultats 10 par 10 dans un seul message
                let messageBatch = '';
                for (let i = 0; i < data.results.length; i++) {
                    messageBatch += `${data.results[i]}\n`; // Ajouter le résultat au message
                    if ((i + 1) % 10 === 0 || i === data.results.length - 1) { // Si 10 résultats ou fin
                        await sendMessage(senderId, messageBatch); // Envoyer le message
                        messageBatch = ''; // Réinitialiser le message pour le prochain lot
                        // Attendre 2 secondes avant d'envoyer le prochain lot
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                // Enregistrer la première page comme l'état actuel
                userStates[senderId].currentPage = 1;
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API :", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard ! 🤖");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "ohab",  // Le nom de la commande
    description: "Recherche des ohabolana en fonction d'un mot-clé et affiche les résultats page par page.",  // Description de la commande
    usage: "Envoyez un mot pour rechercher un ohabolana ou un numéro pour passer à la page suivante."  // Comment utiliser la commande
};
