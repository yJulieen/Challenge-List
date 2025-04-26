const API_KEY = '$2a$10$L0NEVTH8pwvgGJeHaniGMuCKCUtHKykCVM9c9RNQDnotGQmYFpSEC';
const BIN_ID = '680c5e108561e97a5007d6be';

let moderatorMode = false;
let challenges = [];
let currentChallenge = null;
let currentIndex = null;

// Seite lädt
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  currentIndex = parseInt(params.get("index"));
  if (isNaN(currentIndex)) {
    alert("Challenge nicht gefunden!");
    return;
  }

  // Prüfen ob User noch Moderator ist
  if (localStorage.getItem('isModerator') === 'true') {
    moderatorMode = true;
    document.getElementById('moderatorExit').style.display = "inline-block";
    document.getElementById('addVictorSection').style.display = "block";
  }

  await loadChallenges();
  renderPage();
});

// Button Funktionen
function goBack() {
  window.location.href = "index.html";
}

function openModeratorLogin() {
  document.getElementById('moderatorLogin').style.display = 'block';
}

function closeModeratorLogin() {
  document.getElementById('moderatorLogin').style.display = 'none';
}

function checkModerator() {
  const password = document.getElementById('moderatorPassword').value;
  if (password === "1q2w3e4R_") {
    moderatorMode = true;
    localStorage.setItem('isModerator', 'true');
    document.getElementById('moderatorExit').style.display = "inline-block";
    document.getElementById('addVictorSection').style.display = "block";
    closeModeratorLogin();
    renderVictors();
  } else {
    alert("❌ Falsches Passwort!");
  }
}

function leaveModeratorMode() {
  if (confirm("Willst du den Moderator-Modus verlassen?")) {
    moderatorMode = false;
    localStorage.removeItem('isModerator');
    document.getElementById('moderatorExit').style.display = "none";
    document.getElementById('addVictorSection').style.display = "none";
    renderVictors();
  }
}

// Challenges laden
async function loadChallenges() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    challenges = data.record || [];
    currentChallenge = challenges[currentIndex];
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    alert("Fehler beim Laden der Challenge.");
  }
}

// Seite aufbauen
function renderPage() {
  document.getElementById("challengeTitle").textContent = currentChallenge.name;
  document.getElementById("challengeCreator").textContent = `von ${currentChallenge.creator}`;
  document.getElementById("challengeVerifier").textContent = currentChallenge.verifier 
    ? `verifiziert von ${currentChallenge.verifier}` 
    : "verifiziert von Unbekannt";

  renderVictors();
}

// Victors anzeigen
function renderVictors() {
  const list = document.getElementById("victorList");
  list.innerHTML = "";

  (currentChallenge.victors || []).forEach((victor, idx) => {
    const card = document.createElement("div");
    card.className = "victor-card";
    card.innerHTML = `
      <span style="flex-grow:1; text-align:left;">${victor}</span>
      <span style="margin-right:15px;">100%</span>
      ${moderatorMode ? `<button class="delete-btn" onclick="removeVictor(${idx})">🗑️</button>` : ""}
    `;
    list.appendChild(card);
  });
}

// Victor hinzufügen
function addVictor() {
  const input = document.getElementById("newVictorName");
  const name = input.value.trim();
  if (!name) return;

  if (!currentChallenge.victors) currentChallenge.victors = [];
  currentChallenge.victors.push(name);

  input.value = "";
  saveChallenges();
  renderVictors();
}

// Victor löschen
function removeVictor(index) {
  if (confirm("Wirklich löschen?")) {
    currentChallenge.victors.splice(index, 1);
    saveChallenges();
    renderVictors();
  }
}

// Speichern
async function saveChallenges() {
  try {
    challenges[currentIndex] = currentChallenge;
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(challenges)
    });
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    alert("Fehler beim Speichern!");
  }
}
