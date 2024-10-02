const express = require('express');
const bodyParser = require('body-parser');
const handleMessage = require('./handles/handleMessage');
const handlePostback = require('./handles/handlePostback');
require('dotenv').config();

// Ici nous avons besoin d'utiliser l'API pour réagir aux messages
// Vous pouvez utiliser le SDK Facebook Messenger ou une API personnalisée pour gérer les réponses
const axios = require('axios'); // Ou toute autre bibliothèque pour l'API

const app = express();

// Middleware
app.use(bodyParser.json());

// Fonction pour envoyer une réaction (dépend de l'API que vous utilisez)
const api = {
    // Exemple d'API Graph Facebook pour envoyer une réaction
    setMessageReaction: async (reaction, messageID) => {
        try {
            // Supposons que vous ayez un token d'accès et une URL de base pour l'API Graph
            const accessToken = process.env.FB_ACCESS_TOKEN;
            const url = `https://graph.facebook.com/v11.0/${messageID}/reactions`;

            const response = await axios.post(url, {
                access_token: accessToken,
                type: reaction,
            });
            console.log('Réaction ajoutée:', response.data);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réaction:', error);
        }
    }
};

// Route pour le webhook de Facebook
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Route pour recevoir les messages entrants
app.post('/webhook', (req, res) => {
    const body = req.body;
    
    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const event = entry.messaging[0];
            if (event.message) {
                handleMessage(event, api);  // Passer `api` pour permettre les réactions
            } else if (event.postback) {
                handlePostback(event);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
