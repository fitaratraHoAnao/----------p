// Variables de référence
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Fonction pour afficher un message dans la boîte de chat
function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Défiler vers le bas automatiquement
}

// Fonction pour envoyer un message
async function sendMessage() {
    const message = messageInput.value.trim();

    if (message === '') return;

    // Ajouter le message de l'utilisateur à la boîte de chat
    appendMessage('You', message);

    // Vider le champ de texte
    messageInput.value = '';

    try {
        const userId = 'someUserId'; // Remplacez ceci par l'ID utilisateur réel
        // Appeler l'API de Cohere avec le message et l'ID utilisateur
        const response = await fetch(`https://cohere-nouveau.onrender.com/chat?message=${encodeURIComponent(message)}&userId=${userId}`);
        
        // Vérifier si la réponse est valide
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Vérifier que la réponse de l'API contient une réponse
        if (data.response) {
            // Afficher la réponse dans la boîte de chat
            appendMessage('Yazky', data.response);
        } else {
            appendMessage('Yazky', 'Désolé, je n\'ai pas pu comprendre cela.');
        }
    } catch (error) {
        appendMessage('Yazky', 'Désolé, une erreur est survenue. Réessayez plus tard.');
        console.error('Erreur:', error);
    }
}

// Événement clic sur le bouton d'envoi
sendBtn.addEventListener('click', sendMessage);

// Envoyer le message en appuyant sur "Entrée"
messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
