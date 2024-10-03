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
    // Envoyer une requête à l'API pour obtenir une réponse
    const response = await fetch(`https://discussion-continue-gem29.vercel.app/api?ask=${encodeURIComponent(message)}`);
    const data = await response.json();

    // Afficher la réponse dans la boîte de chat
    appendMessage('Yazky', data.response);
  } catch (error) {
    appendMessage('Yazky', 'Désolé, une erreur est survenue. Réessayez plus tard.');
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
