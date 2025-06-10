  const chatContainer = document.getElementById('chat');
  const input = document.getElementById('userInput');

  function appendMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = 'message ' + role;
    msg.textContent = text;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msg;
  }

  async function sendMessage() {
    const prompt = input.value.trim();
    if (!prompt) return;

    const userMsg = appendMessage(prompt, 'user');
    input.value = '';

    const assistantMsg = appendMessage('', 'assistant');

    try {
      const response = await fetch('http://192.168.1.11:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.body) {
        assistantMsg.textContent = '(No response body)';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        assistantMsg.textContent = fullText;
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (err) {
      assistantMsg.textContent = 'Error contacting server.';
      console.error(err);
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
