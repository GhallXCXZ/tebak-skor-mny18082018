/***********************
 * FIREBASE CONFIG
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyA2mdpjT5RvvxMxkXSLF8vnxHk5MaIErS4",
  authDomain: "mny-apk.firebaseapp.com",
  databaseURL: "https://mny-apk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mny-apk",
  storageBucket: "mny-apk.appspot.com",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/***********************
 * ADMIN PIN
 ***********************/
const ADMIN_PIN = "15121203"; // ⬅️ GANTI PIN DI SINI
let adminUnlocked = false;

function unlock() {
  const p = document.getElementById("pin").value;
  if (p === ADMIN_PIN) {
    adminUnlocked = true;

    // sembunyikan pin
    document.getElementById("pinBox").style.display = "none";

    // tampilkan admin area
    document.getElementById("adminArea").style.display = "block";

  } else {
    alert("PIN SALAH");
  }
}


/***********************
 * USER SIDE
 ***********************/
const matchSelect = document.getElementById("matchSelect");
const resultList = document.getElementById("list");

db.ref("matches").on("value", snap => {
  if (!matchSelect) return;

  matchSelect.innerHTML = `<option value="">-- Pilih Pertandingan --</option>`;
  snap.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.key;
    opt.textContent = `${m.val().nama} (${m.val().open ? "OPEN" : "CLOSED"})`;
    matchSelect.appendChild(opt);
  });
});

if (matchSelect) {
  matchSelect.addEventListener("change", () => {
    const matchId = matchSelect.value;
    if (!matchId || !resultList) return;

    db.ref(`matches/${matchId}/results`).on("value", snap => {
      resultList.innerHTML = "";
      snap.forEach(r => {
        const li = document.createElement("li");
        li.innerText = `${r.key} : ${r.val().skor}`;
        resultList.appendChild(li);
      });
    });
  });
}

function kirim() {
  const matchId = matchSelect.value;
  if (!matchId) return alert("Pilih pertandingan dulu");

  db.ref(`matches/${matchId}/open`).once("value", s => {
    if (!s.val()) return alert("Match ditutup");

    const nama = document.getElementById("nama").value.trim();
    const a = document.getElementById("a").value;
    const b = document.getElementById("b").value;

    if (!nama || a === "" || b === "") return alert("Lengkapi data");
    if (a === b) return alert("Skor tidak boleh seri");

    const skor = `${a}-${b}`;

    db.ref(`matches/${matchId}/results/${nama}`).once("value", snap => {
      if (snap.exists()) return alert("Nama sudah pernah mengisi");

      db.ref(`matches/${matchId}/results`).once("value", all => {
        let sama = false;
        all.forEach(r => {
          if (r.val().skor === skor) sama = true;
        });
        if (sama) return alert("Skor sudah dipilih");

        db.ref(`matches/${matchId}/results/${nama}`).set({
          skor,
          waktu: Date.now()
        });
      });
    });
  });
}

/***********************
 * ADMIN SIDE
 ***********************/
const matchList = document.getElementById("matchList");
const adminResult = document.getElementById("adminResult");

db.ref("matches").on("value", snap => {
  if (!matchList) return;
  matchList.innerHTML = "";

  snap.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `
      <b>${m.val().nama}</b><br>

      <button type="button" onclick="toggle('${m.key}', ${m.val().open})">
        ${m.val().open ? "Tutup" : "Buka"}
      </button>

      <button type="button" onclick="lihat('${m.key}')">
        Lihat Hasil
      </button>

      <button type="button" onclick="hapusMatch('${m.key}')"
        style="background:#ef4444;color:white;margin-top:6px;">
        Hapus Match
      </button>
    `;
    matchList.appendChild(li);
  });
});

function tambahMatch() {
  if (!adminUnlocked) return alert("Akses admin ditolak");

  const input = document.getElementById("matchName");
  const nama = input.value.trim();
  if (!nama) return;

  db.ref("matches").push({
    nama,
    open: true,
    results: {}
  });

  input.value = "";
}

function toggle(id, current) {
  if (!adminUnlocked) return alert("Akses admin ditolak");
  db.ref(`matches/${id}/open`).set(!current);
}

function lihat(id) {
  if (!adminResult) return;

  adminResult.innerHTML = "<li>Loading...</li>";
  db.ref(`matches/${id}/results`).off();
  db.ref(`matches/${id}/results`).on("value", snap => {
    adminResult.innerHTML = "";
    if (!snap.exists()) {
      adminResult.innerHTML = "<li>Belum ada tebakan</li>";
      return;
    }
    snap.forEach(r => {
      const li = document.createElement("li");
      li.innerText = `${r.key} : ${r.val().skor}`;
      adminResult.appendChild(li);
    });
  });
}

function hapusMatch(id) {
  if (!adminUnlocked) return alert("Akses admin ditolak");
  if (!confirm("Yakin mau hapus match ini?")) return;

  db.ref(`matches/${id}`).remove();
}
