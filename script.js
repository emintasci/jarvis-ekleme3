const correctPassword = "Emin.1073.";

function checkPassword() {
  const input = document.getElementById("password").value;
  if (input === correctPassword) {
    document.getElementById("login").style.display = "none";
    document.getElementById("jarvis").style.display = "block";
  } else {
    document.getElementById("loginStatus").innerText = "Hatalı şifre!";
  }
}

function startListening() {
  const resultBox = document.getElementById("result");
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "tr-TR";
  recognition.start();

  recognition.onresult = async function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    if (command.includes("öğren")) {
      const response = await handleLearnCommand(command);
      resultBox.innerText = response;
    } else {
      const memoryResponse = recallMemory(command);
      if (memoryResponse !== "Bu konuda daha önce bir şey öğrenmedim.") {
        resultBox.innerText = memoryResponse;
      } else {
        resultBox.innerText = handleBasicCommand(command);
      }
    }
  };

  recognition.onerror = function(event) {
    resultBox.innerText = "Dinleme hatası: " + event.error;
  };
}

async function fetchFromWikipedia(query) {
  try {
    const response = await fetch(`https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.extract || "Bilgi bulunamadı.";
  } catch (error) {
    return "Bilgi alınamadı.";
  }
}

function saveToMemory(topic, content) {
  const memory = JSON.parse(localStorage.getItem("jarvis_memory")) || {};
  memory[topic] = content;
  localStorage.setItem("jarvis_memory", JSON.stringify(memory));
}

function recallMemory(topic) {
  const memory = JSON.parse(localStorage.getItem("jarvis_memory")) || {};
  for (let key in memory) {
    if (topic.includes(key)) {
      return memory[key];
    }
  }
  return "Bu konuda daha önce bir şey öğrenmedim.";
}

async function handleLearnCommand(command) {
  const keyword = command.replace("öğren", "").trim();
  const info = await fetchFromWikipedia(keyword);
  saveToMemory(keyword, info);
  return `"${keyword}" hakkında öğrendim: ${info}`;
}

function handleBasicCommand(command) {
  const now = new Date();
  if (command.includes("selam")) {
    return "Merhaba Stark, seni bekliyordum.";
  } else if (command.includes("saat")) {
    return "Şu an saat " + now.getHours() + ":" + now.getMinutes();
  } else if (command.includes("tarih") || command.includes("gün")) {
    return "Bugün " + now.toLocaleDateString("tr-TR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } else if (command.includes("youtube aç")) {
    window.open("https://www.youtube.com", "_blank");
    return "YouTube açıldı.";
  } else if (command.includes("google aç")) {
    window.open("https://www.google.com", "_blank");
    return "Google açıldı.";
  } else {
    return "Bu komutu anlayamadım.";
  }
}