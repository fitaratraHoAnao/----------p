const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => { 
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je génère votre image...");

        // Construire l'URL de l'API pour générer une image
        const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${encodeURIComponent(prompt)}`;
        
        console.log(`Appel API avec l'URL: ${apiUrl}`);
        
        const response = await axios.get(apiUrl);

        // Récupérer l'URL de l'image dans la réponse de l'API
        const imageUrl = response.data.image_url;
        
        console.log(`Image générée: ${imageUrl}`);

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer l'image générée à l'utilisateur
        await sendMessage(senderId, { 
            attachment: { 
                type: "image", 
                payload: { 
                    url: imageUrl,
                    is_reusable: true 
                } 
            } 
        });

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de génération d\'image:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la génération de l'image.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "generation",  // Le nom de la commande
    description: "Génère une image à partir d'un texte avec l'API Kaizenji.",  // Description de la commande
    usage: "Envoyez 'generation <description>' pour générer une image correspondant à la description."  // Comment utiliser la commande
};
