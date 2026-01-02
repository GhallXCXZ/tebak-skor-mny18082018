// INIT
const scores = JSON.parse(localStorage.getItem("scores")) || [];
const pollOpen = localStorage.getItem("pollOpen") === "true";
const matchTitle = localStorage.getItem("matchTitle") || "Menunggu Admin...";

// USER PAGE
if (document.getElementById("matchTitle")) {
  document.getElementById("matchTitle").innerText = matchTitle;
  document.getElementById("pollStatus").innerText =
    pollOpen ? "Polling Dibuka" : "Polling Ditutup";

  renderScores();
}

// SUBMIT FORM
document.getElementById("scoreForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!pollOpen) {
    alert("Polling sedang ditutup!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const a = document.getElementById("scoreA").value;
  const b = document.getElementById("scoreB").value;

  if (a === b) {
    alert("Skor tidak boleh seri!");
    return;
  }

  const scoreText = `${a}-${b}`;

  const sameScore = scores.find(s => s.score === scoreText);
  if (sameScore) {
    alert("Skor ini sudah dipilih orang lain!");
    return;
  }

  scores.push({ name, score: scoreText });
  localStorage.setItem("scores", JSON.stringify(scores));
  renderScores();
  e.target.reset();
});

// RENDER SCORE
function renderScores() {
  const list = document.getElementById("scoreList");
  list.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
    li.innerText = `${s.name} : ${s.score}`;
    list.appendChild(li);
  });
}

// ADMIN FUNCTIONS
function setMatch() {
  const title = document.getElementById("matchInput").value;
  localStorage.setItem("matchTitle", title);
  document.getElementById("adminStatus").innerText = "Judul diperbarui";
}

function openPoll() {
  localStorage.setItem("pollOpen", true);
  document.getElementById("adminStatus").innerText = "Polling dibuka";
}

function closePoll() {
  localStorage.setItem("pollOpen", false);
  document.getElementById("adminStatus").innerText = "Polling ditutup";
}

function resetData() {
  localStorage.clear();
  document.getElementById("adminStatus").innerText = "Data direset";
}
