const firebaseConfig = {
  apiKey: "AIzaSyA2mdpjT5RvvxMxkXSLF8vnxHk5MaIErS4",
  authDomain: "mny-apk.firebaseapp.com",
  databaseURL: "https://mny-apk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mny-apk",
  storageBucket: "mny-apk.firebasestorage.app",
  messagingSenderId: "632181465576",
  appId: "1:632181465576:web:6ab8dbd8671ce5edd3c45d",
  measurementId: "G-EE5GPSE88G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// LISTENER USER
db.ref("config").on("value", s => {
  if (!s.val()) return;
  if (document.getElementById("judul")) {
    judul.innerText = s.val().judul || "";
    match.innerText = `${s.val().timA} VS ${s.val().timB}`;
    status.innerText = s.val().buka ? "Polling Dibuka" : "Polling Ditutup";
  }
});

db.ref("data").on("value", s => {
  if (!list) return;
  list.innerHTML = "";
  s.forEach(d => {
    let li = document.createElement("li");
    li.innerText = `${d.val().nama} : ${d.val().skor}`;
    list.appendChild(li);
  });
});

// USER SUBMIT
function kirim() {
  db.ref("config/buka").once("value", buka => {
    if (!buka.val()) return alert("Polling ditutup");

    let nama = document.getElementById("nama").value.trim();
    let a = document.getElementById("a").value;
    let b = document.getElementById("b").value;

    if (!nama || a === "" || b === "") return alert("Lengkapi data");
    if (a === b) return alert("Skor tidak boleh seri");

    let skor = a + "-" + b;

    db.ref("data").once("value", snap => {
      let ada = false;
      snap.forEach(d => {
        if (d.val().skor === skor) ada = true;
      });
      if (ada) return alert("Skor sudah dipilih");

      db.ref("data").push({ nama, skor });
    });
  });
}

// ADMIN
function setMatch() {
  db.ref("config").set({
    judul: judulInput.value,
    timA: timA.value,
    timB: timB.value,
    buka: false
  });
  info("Match di-set");
}

function buka() {
  db.ref("config/buka").set(true);
  info("Polling dibuka");
}

function tutup() {
  db.ref("config/buka").set(false);
  info("Polling ditutup");
}

function reset() {
  db.ref("data").remove();
  info("Data direset");
}

function info(t) {
  document.getElementById("info").innerText = t;
}
