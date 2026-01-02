// 🔥 GANTI DENGAN FIREBASE CONFIG KAMU 🔥
const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "xxx.firebaseapp.com",
  databaseURL: "https://xxx.firebaseio.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// USER LISTENER
db.ref("config").on("value", s => {
  if (!document.getElementById("judul")) return;
  document.getElementById("judul").innerText = s.val()?.judul || "Menunggu...";
  document.getElementById("status").innerText =
    s.val()?.buka ? "Polling Dibuka" : "Polling Ditutup";
});

db.ref("data").on("value", s => {
  if (!document.getElementById("list")) return;
  let list = document.getElementById("list");
  list.innerHTML = "";
  s.forEach(d => {
    let li = document.createElement("li");
    li.innerText = `${d.val().nama} : ${d.val().skor}`;
    list.appendChild(li);
  });
});

// USER SUBMIT
function kirim() {
  db.ref("config/buka").once("value", s => {
    if (!s.val()) return alert("Polling ditutup");

    let nama = namaEl().value.trim();
    let a = aEl().value;
    let b = bEl().value;

    if (!nama || a === "" || b === "") return alert("Lengkapi data");
    if (a === b) return alert("Skor tidak boleh seri");

    let skor = a + "-" + b;

    db.ref("data").once("value", snap => {
      let ada = false;
      snap.forEach(d => { if (d.val().skor === skor) ada = true; });
      if (ada) return alert("Skor sudah dipilih");

      db.ref("data").push({ nama, skor });
    });
  });
}

// ADMIN
function setJudul() {
  db.ref("config/judul").set(judulInput.value);
  info("Judul diupdate");
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

// HELPERS
const namaEl = () => document.getElementById("nama");
const aEl = () => document.getElementById("a");
const bEl = () => document.getElementById("b");
const info = t => document.getElementById("info").innerText = t;
