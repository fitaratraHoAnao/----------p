const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');

// Charger les variables d'environnement
dotenv.config();

// Importation des modules existants
const handleMessage = require('./handles/handleMessage');
const handlePostback = require('./handles/handlePostback');
const geminiRoutes = require('./pilot/gemini');

const app = express();

// Configuration des middlewares
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de multer pour le téléchargement de fichiers
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// API pour gérer les réactions
const api = {
    setMessageReaction: async (reaction, messageID) => {
        try {
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

// Route pour le webhook Facebook
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

// Route pour recevoir les messages entrants via Messenger
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const event = entry.messaging[0];
            if (event.message) {
                handleMessage(event, api); // Passer `api` pour permettre les réactions
            } else if (event.postback) {
                handlePostback(event);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Routes pour l'API Gemini
app.use('/gemini', geminiRoutes);

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://0.0.0.0:${PORT}`);
});
