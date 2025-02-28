
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const { 
  GoogleGenerativeAI,
  HarmCategory, 
  HarmBlockThreshold 
} = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const router = express.Router();

// Configuration de multer pour le stockage temporaire des fichiers
const upload = multer({ 
    dest: os.tmpdir(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Initialisation de l'API Gemini et du gestionnaire de fichiers
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Configuration de génération par défaut
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Stockage des sessions
const sessions = {};

// Fonction pour télécharger l'image depuis une URL
async function downloadImage(url) {
    try {
        const response = await axios({ url, responseType: 'stream' });
        const tempPath = path.join(os.tmpdir(), `image_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempPath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement de l\'image:', error);
        return null;
    }
}

// Fonction pour télécharger un fichier vers Gemini
async function uploadToGemini(filePath, mimeType) {
    try {
        // Vérifier que le fichier existe
        if (!fs.existsSync(filePath)) {
            throw new Error(`Le fichier ${filePath} n'existe pas`);
        }
        
        // Obtenir les statistiques du fichier
        const stats = fs.statSync(filePath);
        console.log(`Taille du fichier: ${stats.size} octets`);
        
        if (stats.size === 0) {
            throw new Error('Le fichier est vide');
        }
        
        const displayName = path.basename(filePath);
        console.log(`Tentative de téléchargement du fichier ${displayName} de type ${mimeType}`);
        
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: displayName,
        });
        
        const file = uploadResult.file;
        console.log(`Fichier téléchargé ${file.displayName} comme: ${file.name}`);
        return file;
    } catch (error) {
        console.error('Erreur lors du téléchargement vers Gemini:', error);
        throw error;
    }
}

// Route principale pour l'API Gemini
router.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API Gemini. Utilisez /chat avec un prompt et un uid pour discuter.');
});

// Route GET pour le chat avec Gemini (avec paramètres dans l'URL)
router.get('/chat', async (req, res) => {
  try {
    const { prompt, uid, imageUrl } = req.query;

    if (!prompt) {
      return res.status(400).json({ erreur: "Le paramètre 'prompt' est requis" });
    }

    let response;
    if (imageUrl && imageUrl.trim() !== '') {
        try {
            const imagePath = await downloadImage(imageUrl);
            if (!imagePath) {
                return res.status(400).json({ 
                    erreur: 'Impossible de télécharger l\'image depuis l\'URL fournie' 
                });
            }

            // Télécharger l'image vers Gemini
            const file = await uploadToGemini(imagePath, 'image/jpeg');

            // Créer une session de chat avec l'historique (if applicable)
            const modelName = "gemini-2.0-flash"; //Use a default model.
            const model = genAI.getGenerativeModel({ model: modelName });
            const chatSession = model.startChat({ generationConfig }); //No history for GET

            const result = await chatSession.sendMessage([
                {
                    fileData: {
                        mimeType: file.mimeType,
                        fileUri: file.uri,
                    }
                },
                { text: prompt }
            ]);

            response = result.response.text();

            fs.unlinkSync(imagePath);

        } catch (error) {
            console.error('Erreur lors du traitement de l\'image:', error);
            return res.status(500).json({ erreur: 'Erreur lors du traitement de l\'image', details: error.message });
        }
    } else {
        const modelName = "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        const chatSession = model.startChat({ generationConfig });
        const result = await chatSession.sendMessage(prompt);
        response = result.response.text();
    }

    res.json({ response: response });

  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    res.status(500).json({ erreur: "Une erreur est survenue lors du traitement de votre demande", details: error.message });
  }
});

// Route POST pour le chat avec Gemini (avec corps JSON)
router.post('/chat', async (req, res) => {
  try {
    const { prompt, uid, imageUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ erreur: "Le paramètre 'prompt' est requis" });
    }

    if (!uid) {
      return res.status(400).json({ erreur: "Le paramètre 'uid' est requis" });
    }

    let response;

    // Vérifier si une URL d'image est fournie
    if (imageUrl && imageUrl.trim() !== '') {
      try {
          const imagePath = await downloadImage(imageUrl);
          if (!imagePath) {
              return res.status(400).json({ 
                  erreur: 'Impossible de télécharger l\'image depuis l\'URL fournie' 
              });
          }

          // Télécharger l'image vers Gemini
          const file = await uploadToGemini(imagePath, 'image/jpeg');

          if (!sessions[uid]) {
              sessions[uid] = [];
          }
          const history = sessions[uid];
          const modelName = "gemini-2.0-flash";
          const model = genAI.getGenerativeModel({ model: modelName });
          const chatSession = model.startChat({
              generationConfig,
              history: history.map(msg => ({
                  role: msg.role,
                  parts: msg.parts
              }))
          });

          const result = await chatSession.sendMessage([
              {
                  fileData: {
                      mimeType: file.mimeType,
                      fileUri: file.uri,
                  }
              },
              { text: prompt }
          ]);

          response = result.response.text();

          history.push({ 
              role: 'user', 
              parts: [
                  { 
                      fileData: {
                          mimeType: file.mimeType,
                          fileUri: file.uri,
                      }
                  },
                  { text: prompt }
              ] 
          });

          history.push({ 
              role: 'model', 
              parts: [{ text: response }] 
          });

          fs.unlinkSync(imagePath);

      } catch (error) {
          console.error('Erreur lors de l\'analyse de l\'image:', error);
          return res.status(500).json({ 
              erreur: 'Erreur lors de l\'analyse de l\'image',
              details: error.message 
          });
      }
    } else {
      // Conversation texte standard
        if (!sessions[uid]) {
            sessions[uid] = [];
        }
        const history = sessions[uid];
        const modelName = "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        const chatSession = model.startChat({
            generationConfig,
            history: history.map(msg => ({
                role: msg.role,
                parts: msg.parts
            }))
        });

        const result = await chatSession.sendMessage(prompt);
        response = result.response.text();

        history.push({ role: 'user', parts: [{ text: prompt }] });
        history.push({ role: 'model', parts: [{ text: response }] });
    }

    res.json({ response: response });

  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    res.status(500).json({ 
      erreur: "Une erreur est survenue lors du traitement de votre demande", 
      details: error.message 
    });
  }
});

// Route pour réinitialiser la conversation
router.post('/reset', (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ erreur: "Le paramètre 'uid' est requis" });
        }

        // Supprimer l'historique du chat pour cet utilisateur
        if (sessions[uid]) {
            sessions[uid] = [];
        }

        res.json({ success: true, message: "Conversation réinitialisée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation de la conversation:', error);
        res.status(500).json({ 
            erreur: "Une erreur est survenue lors de la réinitialisation de la conversation", 
            details: error.message 
        });
    }
});

// Route pour l'upload direct de fichier
router.post('/chat-with-file', upload.single('file'), async (req, res) => {
    try {
        const { prompt, uid } = req.body;
        const file = req.file;

        if (!prompt) {
            return res.status(400).json({ erreur: "Le paramètre 'prompt' est requis" });
        }

        if (!uid) {
            return res.status(400).json({ erreur: "Le paramètre 'uid' est requis" });
        }

        if (!file) {
            return res.status(400).json({ erreur: "Aucun fichier n'a été uploadé" });
        }

        // Déterminer le type MIME
        let mimeType;
        if (file.mimetype.startsWith('image/')) {
            mimeType = file.mimetype;
        } else if (file.mimetype === 'application/pdf') {
            mimeType = 'application/pdf';
        } else if (file.mimetype === 'application/msword' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Pour les fichiers Word (.doc et .docx)
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            console.log('Traitement de fichier Word:', file.originalname, 'avec MIME:', mimeType);
        } else if (file.mimetype === 'application/vnd.ms-powerpoint' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            mimeType = file.mimetype;
        } else {
            console.log('Type MIME non pris en charge:', file.mimetype);
            return res.status(400).json({ erreur: "Le type de fichier n'est pas pris en charge" });
        }

        try {
            // Télécharger le fichier vers Gemini
            console.log('Tentative de téléchargement vers Gemini:', file.path, 'avec MIME:', mimeType);
            const geminiFile = await uploadToGemini(file.path, mimeType);
            console.log('Fichier téléchargé avec succès vers Gemini:', geminiFile.name);

            // Création ou récupération de l'historique de chat
            if (!sessions[uid]) {
                sessions[uid] = [];
            }
            const history = sessions[uid];
            
            // Créer une session de chat
            const modelName = "gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ model: modelName });
            const chatSession = model.startChat({
                generationConfig,
                history: history.map(msg => ({
                    role: msg.role,
                    parts: msg.parts
                }))
            });

            // Envoyer le message avec le fichier
            const result = await chatSession.sendMessage([
                {
                    fileData: {
                        mimeType: geminiFile.mimeType,
                        fileUri: geminiFile.uri,
                    }
                },
                { text: prompt }
            ]);

            const response = result.response.text();

            // Mettre à jour l'historique
            history.push({ 
                role: 'user', 
                parts: [
                    { 
                        fileData: {
                            mimeType: geminiFile.mimeType,
                            fileUri: geminiFile.uri,
                        }
                    },
                    { text: prompt }
                ] 
            });
            history.push({ role: 'model', parts: [{ text: response }] });

            // Supprimer le fichier temporaire
            fs.unlinkSync(file.path);

            res.json({ response: response });
            
        } catch (uploadError) {
            console.error('Erreur lors du téléchargement du fichier vers Gemini:', uploadError);
            return res.status(500).json({ 
                erreur: "Erreur lors du traitement du fichier", 
                details: uploadError.message 
            });
        }

        // Ce code est maintenant dans le bloc try pour éviter l'erreur

    } catch (error) {
        console.error('Erreur lors du traitement de la requête avec fichier:', error);
        res.status(500).json({ 
            erreur: "Une erreur est survenue lors du traitement de votre demande", 
            details: error.message 
        });
    }
});

module.exports = router;
