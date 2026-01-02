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

// INIT FIREBASE
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/***********************
 * USER SIDE
 ***********************/
const matchSelect = document.getElementById("matchSelect");
const resultList = document.getElementById("list");

// LOAD MATCH LIST
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

// LOAD RESULT USER
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

// SUBMIT TEBakan
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

    // 1 nama 1 tebakan
    db.ref(`matches/${matchId}/results/${nama}`).once("value", snap => {
      if (snap.exists()) return alert("Nama ini sudah mengisi");

      // skor tidak boleh sama
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
 * ADMIN SIDE (FIXED)
 ***********************/
const matchList = document.getElementById("matchList");
const adminResult = document.getElementById("adminResult");

let currentAdminMatchId = null;

// LOAD MATCH ADMIN
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
    `;
    matchList.appendChild(li);
  });
});

// OPEN / CLOSE MATCH
function toggle(id, current) {
  db.ref(`matches/${id}/open`).set(!current);
}

// LIHAT HASIL (FIX UTAMA 🔥)
function lihat(id) {
  if (!adminResult) return;
  currentAdminMatchId = id;

  adminResult.innerHTML = "<li>Loading...</li>";

  db.ref(`matches/${id}/results`).off(); // bersihin listener lama
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

