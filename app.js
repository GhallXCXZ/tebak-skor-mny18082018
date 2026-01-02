firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== USER =====
const select = document.getElementById("matchSelect");
const list = document.getElementById("list");

// LOAD MATCH
db.ref("matches").on("value", snap => {
  if (!select) return;
  select.innerHTML = `<option value="">Pilih Pertandingan</option>`;
  snap.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m.key;
    opt.textContent = `${m.val().nama} (${m.val().open ? "OPEN" : "CLOSED"})`;
    select.appendChild(opt);
  });
});

// LOAD RESULT USER
select?.addEventListener("change", () => loadResult());

function loadResult() {
  let id = select.value;
  if (!id || !list) return;
  db.ref(`matches/${id}/results`).on("value", snap => {
    list.innerHTML = "";
    snap.forEach(r => {
      let li = document.createElement("li");
      li.textContent = `${r.key} : ${r.val().skor}`;
      list.appendChild(li);
    });
  });
}

// SUBMIT
function kirim() {
  let id = select.value;
  if (!id) return alert("Pilih pertandingan");

  db.ref(`matches/${id}/open`).once("value", s => {
    if (!s.val()) return alert("Match ditutup");

    let nama = document.getElementById("nama").value.trim();
    let a = document.getElementById("a").value;
    let b = document.getElementById("b").value;

    if (!nama || a === "" || b === "") return alert("Lengkapi data");
    if (a === b) return alert("Skor tidak boleh seri");

    let skor = `${a}-${b}`;

    db.ref(`matches/${id}/results/${nama}`).once("value", snap => {
      if (snap.exists())
        return alert("Nama ini sudah pernah mengisi");

      db.ref(`matches/${id}/results`).once("value", rs => {
        let sama = false;
        rs.forEach(r => {
          if (r.val().skor === skor) sama = true;
        });
        if (sama) return alert("Skor sudah dipilih");

        db.ref(`matches/${id}/results/${nama}`).set({
          skor: skor,
          waktu: Date.now()
        });
      });
    });
  });
}

// ===== ADMIN =====
const matchList = document.getElementById("matchList");
const adminResult = document.getElementById("adminResult");

// ADMIN LOAD MATCH
db.ref("matches").on("value", snap => {
  if (!matchList) return;
  matchList.innerHTML = "";
  snap.forEach(m => {
    let li = document.createElement("li");
    li.innerHTML = `
      <b>${m.val().nama}</b>
      <button onclick="toggle('${m.key}', ${m.val().open})">
        ${m.val().open ? "Tutup" : "Buka"}
      </button>
      <button onclick="lihat('${m.key}')">Lihat Hasil</button>
    `;
    matchList.appendChild(li);
  });
});

// TAMBAH MATCH
function tambahMatch() {
  let nama = document.getElementById("matchName").value.trim();
  if (!nama) return;

  db.ref("matches").push({
    nama,
    open: true,
    results: {}
  });

  document.getElementById("matchName").value = "";
}

// OPEN / CLOSE
function toggle(id, current) {
  db.ref(`matches/${id}/open`).set(!current);
}

// ADMIN VIEW RESULT
function lihat(id) {
  if (!adminResult) return;
  db.ref(`matches/${id}/results`).on("value", snap => {
    adminResult.innerHTML = "";
    snap.forEach(r => {
      let li = document.createElement("li");
      li.textContent = `${r.key} : ${r.val().skor}`;
      adminResult.appendChild(li);
    });
  });
}
