const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

let isAbreviationMode = false; // État de la conversation

module.exports = async (senderId, prompt) => {
    try {
        if (!isAbreviationMode) {
            if (prompt === "abreviation") {
                isAbreviationMode = true;
                await sendMessage(senderId, "Vous pouvez maintenant me demander une abréviation spécifique ou me demander la liste des abréviations disponibles.");
                return;
            } else {
                await sendMessage(senderId, "Veuillez commencer par 'abreviation' pour activer le mode d'abréviations.");
                return;
            }
        }

        // Appeler l'API en fonction du prompt
        let apiUrl;
        if (prompt === "liste") {
            apiUrl = `https://abrviation.vercel.app/recherche?abreviation=liste`;
        } else {
            apiUrl = `https://abrviation.vercel.app/recherche?query=${encodeURIComponent(prompt)}`;
        }

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        const response = await axios.get(apiUrl);
        let reply;

        // Vérifier le format de la réponse et formater la réponse
        if (Array.isArray(response.data)) {
            // Réponse pour la liste d'abréviations
            reply = response.data.map(item => `${item.abreviation}: ${item.definition}`).join('\n');

            // Diviser la réponse en morceaux tout en évitant de couper les abréviations
            const chunkSize = 2000; // Taille maximale de chaque message
            const chunks = [];
            let currentChunk = '';

            // Ajouter chaque abréviation au morceau courant jusqu'à atteindre la taille maximale
            for (const line of reply.split('\n')) {
                if (currentChunk.length + line.length + 1 > chunkSize) { // +1 pour le saut de ligne
                    if (currentChunk) {
                        chunks.push(currentChunk);
                    }
                    currentChunk = line; // Démarrer un nouveau morceau avec la ligne actuelle
                } else {
                    currentChunk += (currentChunk ? '\n' : '') + line; // Ajouter la ligne actuelle
                }
            }
            // Ajouter le dernier morceau si existe
            if (currentChunk) {
                chunks.push(currentChunk);
            }

            // Envoyer chaque morceau successivement
            for (const chunk of chunks) {
                await sendMessage(senderId, chunk);
                // Attendre 1 seconde entre les envois pour éviter d'être trop rapide
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return; // Fin de l'envoi pour la liste
        } else {
            // Réponse pour une abréviation spécifique
            reply = `${response.data.abreviation}: ${response.data.definition}`;
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API d\'abréviations:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "abreviation",  // Le nom de la commande
    description: "Recherche une abréviation ou affiche toutes les abréviations disponibles.",  // Description de la commande
    usage: "Envoyez 'abreviation' pour activer le mode d'abréviations."  // Comment utiliser la commande
};
