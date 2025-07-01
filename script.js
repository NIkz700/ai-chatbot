const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const langSelect = document.getElementById("langSelect");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  const lang = langSelect.value;
  appendMessage("You", text);
  userInput.value = "";

  let englishText = text;
  if (lang === "tl") {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "tl",
        target: "en",
        format: "text",
      }),
    });
    const data = await res.json();
    englishText = data.translatedText;
  }

  const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: englishText })
  });

  const aiData = await response.json();
  let reply = aiData.generated_text || "Sorry, I didn’t understand that.";

  if (lang === "tl") {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: reply,
        source: "en",
        target: "tl",
        format: "text",
      }),
    });
    const translated = await res.json();
    reply = translated.translatedText;
  }

  appendMessage("🤖 Robot", reply);
}

function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = langSelect.value === "tl" ? "tl-PH" : "en-US";
  recognition.start();
  recognition.onresult = function (event) {
    userInput.value = event.results[0][0].transcript;
    sendMessage();
  };
}
