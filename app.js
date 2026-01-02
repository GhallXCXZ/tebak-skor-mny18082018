const firebaseConfig = {
  apiKey: "AIzaSyA2mdpjT5RvvxMxkXSLF8vnxHk5MaIErS4",
  authDomain: "xxx.firebaseapp.com",
  databaseURL: "https://mny-apk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mny-apk",
  storageBucket: "mny-apk.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== USER =====
const select = document.getElementById("matchSelect");
const list = document.getElementById("list");

db.ref("matches").on("value", snap => {
  if (!select) return;

  select.innerHTML = `<option value="">-- Pilih Pertandingan --</option>`;
  snap.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m.key;
    opt.textContent = m.val().nama;
    select.appendChild(opt);
  });
});

function kirim() {
  let matchId = select.value;
  let nama = document.getElementById("nama").value.trim();
  let a = document.getElementById("a").value;
  let b = document.getElementById("b").value;

  if (!matchId) return alert("Pilih pertandingan");
  if (!nama || a === "" || b === "") return alert("Lengkapi data");
  if (a === b) return alert("Skor tidak boleh seri");

  let skor = a + "-" + b;

  db.ref("matches/" + matchId + "/data").once("value", snap => {
    let sama = false;
    snap.forEach(d => {
      if (d.val().skor === skor) sama = true;
    });
    if (sama) return alert("Skor sudah dipilih");

    db.ref("matches/" + matchId + "/data").push({ nama, skor });
  });
}

// ===== ADMIN =====
const matchList = document.getElementById("matchList");

function tambahMatch() {
  let nama = document.getElementById("matchName").value.trim();
  if (!nama) return alert("Isi nama match");

  db.ref("matches").push({
    nama: nama
  });

  document.getElementById("matchName").value = "";
}

db.ref("matches").on("value", snap => {
  if (!matchList) return;
  matchList.innerHTML = "";
  snap.forEach(m => {
    let li = document.createElement("li");
    li.textContent = m.val().nama;
    matchList.appendChild(li);
  });
});
