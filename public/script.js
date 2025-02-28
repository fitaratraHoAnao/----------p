// Fonction pour générer un ID utilisateur unique
function getUID() {
    if (!localStorage.getItem('chatUID')) {
        localStorage.setItem('chatUID', 'user_' + Math.random().toString(36).substr(2, 9));
    }
    return localStorage.getItem('chatUID');
}

// Variables globales
const uid = getUID();
let selectedFiles = [];
let selectedFileURLs = [];

// Éléments DOM
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const clearButton = document.getElementById('clearButton');

// Ajuster automatiquement la hauteur du textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
});

// Gérer l'envoi par la touche Entrée (Shift+Entrée pour un saut de ligne)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Gérer le clic sur le bouton d'envoi
sendButton.addEventListener('click', sendMessage);

// Gérer la sélection de fichier
fileInput.addEventListener('change', handleFileSelect);

// Gérer le clic sur le bouton d'effacement
clearButton.addEventListener('click', clearConversation);

// Fonction pour gérer la sélection de fichier
function handleFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier les types de fichiers autorisés
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isPpt = file.type === 'application/vnd.ms-powerpoint' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        if (!isImage && !isPdf && !isDoc && !isPpt) {
            alert(`Le type de fichier "${file.name}" n'est pas pris en charge`);
            continue;
        }

        // Ajouter le fichier à la sélection
        selectedFiles.push(file);
        const fileURL = URL.createObjectURL(file);
        selectedFileURLs.push(fileURL);

        // Créer un aperçu pour chaque fichier
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'file-thumbnail';
        thumbnailDiv.dataset.index = selectedFiles.length - 1;

        if (isImage) {
            thumbnailDiv.innerHTML = `
                <img src="${fileURL}" alt="Aperçu">
                <div class="file-name">${file.name}</div>
                <button class="remove-file" onclick="removeFileAtIndex(${selectedFiles.length - 1})">×</button>
            `;
        } else {
            // Icône pour les autres types de fichiers
            let icon = '📄';
            if (isPdf) icon = '📑';
            if (isDoc) icon = '📝';
            if (isPpt) icon = '📊';

            thumbnailDiv.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${file.name}</div>
                <button class="remove-file" onclick="removeFileAtIndex(${selectedFiles.length - 1})">×</button>
            `;
        }

        filePreview.appendChild(thumbnailDiv);
    }

    // Réinitialiser l'input file pour permettre la sélection des mêmes fichiers
    fileInput.value = '';
}

// Fonction pour supprimer un fichier spécifique
function removeFileAtIndex(index) {
    if (index < 0 || index >= selectedFiles.length) return;

    // Révoquer l'URL et supprimer le fichier du tableau
    URL.revokeObjectURL(selectedFileURLs[index]);
    selectedFiles.splice(index, 1);
    selectedFileURLs.splice(index, 1);

    // Mettre à jour l'affichage
    updateFilePreview();
}

// Fonction pour mettre à jour l'aperçu des fichiers
function updateFilePreview() {
    filePreview.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'file-thumbnail';
        thumbnailDiv.dataset.index = index;

        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isPpt = file.type === 'application/vnd.ms-powerpoint' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        if (isImage) {
            thumbnailDiv.innerHTML = `
                <img src="${selectedFileURLs[index]}" alt="Aperçu">
                <div class="file-name">${file.name}</div>
                <button class="remove-file" onclick="removeFileAtIndex(${index})">×</button>
            `;
        } else {
            // Icône pour les autres types de fichiers
            let icon = '📄';
            if (isPdf) icon = '📑';
            if (isDoc) icon = '📝';
            if (isPpt) icon = '📊';

            thumbnailDiv.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${file.name}</div>
                <button class="remove-file" onclick="removeFileAtIndex(${index})">×</button>
            `;
        }

        filePreview.appendChild(thumbnailDiv);
    });
}

// Fonction pour supprimer tous les fichiers sélectionnés
function removeAllFiles() {
    // Révoquer les URLs
    selectedFileURLs.forEach(url => URL.revokeObjectURL(url));

    // Réinitialiser les tableaux
    selectedFiles = [];
    selectedFileURLs = [];

    // Vider l'aperçu
    filePreview.innerHTML = '';
    fileInput.value = '';
}

// Fonction pour ajouter un message au chat
function addMessage(text, isUser = false, imageUrls = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    let messageContent = `<div class="message-content"><p>${formatMessage(text)}</p>`;

    // Gérer plusieurs images ou fichiers
    if (imageUrls) {
        if (Array.isArray(imageUrls)) {
            // Plusieurs fichiers
            messageContent += `<div class="files-container">`;
            imageUrls.forEach(url => {
                const fileName = selectedFiles.find((_, index) => selectedFileURLs[index] === url)?.name || '';

                // Vérifier si c'est une image
                if (url.startsWith('blob:') && (
                    fileName.endsWith('.jpg') || 
                    fileName.endsWith('.jpeg') || 
                    fileName.endsWith('.png') || 
                    fileName.endsWith('.gif') ||
                    fileName.endsWith('.webp')
                )) {
                    messageContent += `
                        <div class="file-item">
                            <img src="${url}" alt="Fichier envoyé" class="message-file">
                            <div class="file-caption">${fileName}</div>
                        </div>
                    `;
                } else {
                    // Afficher une icône pour les autres types de fichiers
                    let fileIcon = '📄';
                    if (fileName.endsWith('.pdf')) fileIcon = '📑';
                    else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) fileIcon = '📝';
                    else if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) fileIcon = '📊';

                    messageContent += `
                        <div class="file-item">
                            <div class="file-icon-large">${fileIcon}</div>
                            <div class="file-caption">${fileName}</div>
                        </div>
                    `;
                }
            });
            messageContent += `</div>`;
        } else {
            // Un seul fichier (ancienne méthode)
            messageContent += `<img src="${imageUrls}" alt="Image envoyée" class="message-file">`;
        }
    }

    messageContent += `<div class="message-time">${getCurrentTime()}</div></div>`;

    messageDiv.innerHTML = messageContent;
    chatMessages.appendChild(messageDiv);

    // Faire défiler vers le bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour formater le message (markdown simple)
function formatMessage(text) {
    return text
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Fonction pour effacer la conversation
async function clearConversation() {
    if (confirm("Voulez-vous vraiment effacer toute la conversation ?")) {
        // Vider l'interface utilisateur
        chatMessages.innerHTML = '';

        // Ajouter le message de bienvenue initial
        addMessage("Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?", false);

        // Réinitialiser l'ID utilisateur pour créer une nouvelle session
        localStorage.removeItem('chatUID');
        const newUid = getUID();

        try {
            // Appeler l'API pour réinitialiser la conversation côté serveur
            await fetch('/gemini/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: newUid })
            });

            console.log("Conversation réinitialisée avec succès");
        } catch (error) {
            console.error("Erreur lors de la réinitialisation de la conversation:", error);
        }
    }
}

// Fonction pour obtenir l'heure actuelle
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Fonction pour afficher un indicateur de chargement
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading';
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour supprimer l'indicateur de chargement
function hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Fonction pour envoyer un message
async function sendMessage() {
    const message = userInput.value.trim();

    if (!message && selectedFiles.length === 0) {
        return;
    }

    // Réinitialiser l'entrée utilisateur
    userInput.value = '';
    userInput.style.height = 'auto';

    // Si nous avons des fichiers, les traiter un par un
    if (selectedFiles.length > 0) {
        // Afficher les fichiers dans le chat
        const fileURLs = [...selectedFileURLs]; // Copie pour éviter les problèmes si removeAllFiles est appelé

        // Ajouter le message utilisateur au chat avec tous les fichiers
        addMessage(message, true, fileURLs);

        // Traiter chaque fichier séparément
        for (let i = 0; i < selectedFiles.length; i++) {
            // Afficher l'indicateur de chargement
            showLoading();

            try {
                const formData = new FormData();
                formData.append('prompt', message);
                formData.append('uid', uid);
                formData.append('file', selectedFiles[i]);

                const response = await fetch('/gemini/chat-with-file', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                // Supprimer l'indicateur de chargement
                hideLoading();

                // Ajouter la réponse au chat
                if (data.response) {
                    // Remplacer Gemini par Bruno dans la réponse
                    let modifiedResponse = data.response.replace(/Gemini/g, 'Bruno').replace(/gemini/g, 'bruno');
                    // Remplacer la phrase d'identification de l'IA avec plusieurs variantes
                    modifiedResponse = modifiedResponse.replace(/Je suis un grand modèle de langage, entraîné par Google/g, 'Je suis une création de ❤️Bruno Rakotomalala❤️, conçue pour vous aider');
                    modifiedResponse = modifiedResponse.replace(/Je suis un modèle de langage IA/g, 'Je suis un assistant développé par ❤️Bruno Rakotomalala❤️');
                    modifiedResponse = modifiedResponse.replace(/Je suis un assistant IA entraîné par Google/g, 'Je suis l\'assistant intelligent de ❤️Bruno Rakotomalala❤️');
                    modifiedResponse = modifiedResponse.replace(/Je suis une IA créée par Google/g, 'Je suis l\'IA personnelle de ❤️Bruno Rakotomalala❤️');
                    addMessage(`Pour "${selectedFiles[i].name}" : \n\n${modifiedResponse}`);
                } else if (data.erreur) {
                    addMessage(`Erreur avec "${selectedFiles[i].name}" : ${data.erreur}`);
                }

                // Courte pause entre les requêtes pour éviter de surcharger l'API
                if (i < selectedFiles.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error('Erreur:', error);
                hideLoading();
                addMessage(`Erreur avec "${selectedFiles[i].name}" : Erreur de communication avec le serveur. Veuillez réessayer plus tard.`);
            }
        }

        // Réinitialiser les fichiers
        removeAllFiles();
    } else {
        // Ajouter le message utilisateur au chat
        addMessage(message, true);

        // Afficher l'indicateur de chargement
        showLoading();

        try {
            // Envoi de requête standard sans fichier
            const response = await fetch('/gemini/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: message,
                    uid: uid
                })
            });

            const data = await response.json();

            // Supprimer l'indicateur de chargement
            hideLoading();

            // Ajouter la réponse au chat
            if (data.response) {
                // Remplacer Gemini par Bruno dans la réponse
                let modifiedResponse = data.response.replace(/Gemini/g, 'Bruno').replace(/gemini/g, 'bruno');
                // Remplacer la phrase d'identification de l'IA avec plusieurs variantes
                modifiedResponse = modifiedResponse.replace(/Je suis un grand modèle de langage, entraîné par Google/g, 'Je suis une création de ❤️Bruno Rakotomalala❤️, conçue pour vous aider');
                modifiedResponse = modifiedResponse.replace(/Je suis un modèle de langage IA/g, 'Je suis un assistant développé par ❤️Bruno Rakotomalala❤️');
                modifiedResponse = modifiedResponse.replace(/Je suis un assistant IA entraîné par Google/g, 'Je suis l\'assistant intelligent de ❤️Bruno Rakotomalala❤️');
                modifiedResponse = modifiedResponse.replace(/Je suis une IA créée par Google/g, 'Je suis l\'IA personnelle de ❤️Bruno Rakotomalala❤️');
                addMessage(modifiedResponse);
            } else if (data.erreur) {
                addMessage(`Erreur: ${data.erreur}`);
            }
        } catch (error) {
            console.error('Erreur:', error);
            hideLoading();
            addMessage('Erreur de communication avec le serveur. Veuillez réessayer plus tard.');
        }
    }
}