const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une correction...");

        // Appeler l'API de correction orthographique avec le message de l'utilisateur
        const apiUrl = `https://check-orthographe-francais.onrender.com/check`;
        const response = await axios.post(apiUrl, {
            text: prompt,      // Texte à corriger
            language: 'fr'     // Langue pour la correction (ici français)
        });

        // Récupérer les corrections dans la réponse de l'API
        const corrections = response.data.corrections;

        // Initialiser le texte corrigé en utilisant le message original
        let correctedText = prompt;

        // Construire la réponse avec les corrections et suggestions
        let reply = '';
        if (corrections.length > 0) {
            reply = 'Voici les suggestions de correction :\n';
            
            corrections.forEach((correction, index) => {
                reply += `${index + 1}. ${correction.message}\nSuggestions : ${correction.suggestions.join(', ')}\n\n`;

                // Remplacer le mot ou la phrase incorrect(e) par la première suggestion dans le texte corrigé
                const wordToReplace = correction.word;  // Le mot ou l'expression à remplacer
                const suggestion = correction.suggestions[0];  // Prendre la première suggestion
                
                if (suggestion) {
                    // Utilisation d'une expression régulière pour s'assurer que seules les occurrences exactes du mot sont remplacées
                    const regex = new RegExp(`\\b${wordToReplace}\\b`, 'g');
                    correctedText = correctedText.replace(regex, suggestion);
                }
            });

            // Ajouter la version corrigée du texte à la fin
            reply += `\nTexte corrigé :\n${correctedText}`;
        } else {
            reply = 'Aucune faute trouvée dans votre message.';
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de correction à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de correction:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "check",  // Le nom de la commande pour la correction orthographique
    description: "Permet de corriger les fautes d'orthographe dans un message et d'afficher le texte corrigé.",  // Description de la commande
    usage: "Envoyez 'check <message>' pour vérifier et corriger les fautes d'orthographe."  // Comment utiliser la commande
};
        
