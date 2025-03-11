const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, prompt) => { 
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je génère votre image...");

        // Vérifier si le prompt est vide
        if (!prompt || prompt.trim() === '') {
            prompt = 'fille'; // valeur par défaut
        }

        // Construire l'URL de l'API pour générer une image
        const apiUrl = `https://kaiz-apis.gleeze.com/api/text2image?prompt=${encodeURIComponent(prompt)}`;
        
        console.log(`Appel API avec l'URL: ${apiUrl}`);
        
        // Configurer la réponse pour recevoir les données binaires
        const response = await axios({
            method: 'get',
            url: apiUrl,
            responseType: 'arraybuffer'
        });

        // Créer le dossier temp s'il n'existe pas
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Sauvegarder l'image reçue
        const imagePath = path.join(tempDir, `image_${Date.now()}.jpg`);
        fs.writeFileSync(imagePath, response.data);
        
        console.log(`Image sauvegardée: ${imagePath}`);

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer l'image générée à l'utilisateur
        await sendMessage(senderId, { 
            attachment: { 
                type: "image", 
                payload: { 
                    is_reusable: true,
                    attachment_id: path.resolve(imagePath) // Chemin absolu vers l'image
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
