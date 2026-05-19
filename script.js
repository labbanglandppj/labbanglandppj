// 🔥 URL API GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbx7MwGGPT_P2_fOuq3NLXtQ7qYQ8reAEIFG7jt2c9uXM8E5AQVO11uKQ2A7c3rZ4lGY/exec";


// ============================
// 🔐 LOGIN SYSTEM
// ============================
function openLogin() {
  document.getElementById("loginModal").style.display = "block";
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "123") {
    localStorage.setItem("isAdmin", "true");
    alert("Login berhasil sebagai Admin");
    closeLogin();
    updateAdminUI();
    loadPage("data-alat");
  } else {
    alert("Username / Password salah!");
  }
}

function isAdmin() {
  return localStorage.getItem("isAdmin") === "true";
}


// ============================
// 🔥 HANDLE LOGIN / LOGOUT
// ============================
function handleAuth() {
  if (isAdmin()) {
    localStorage.removeItem("isAdmin");
    alert("Logout berhasil");
    updateAdminUI();
    loadPage("dashboard");
  } else {
    openLogin();
  }
}


// ============================
// 🔥 UPDATE UI ADMIN MODE
// ============================
function updateAdminUI() {
  const btn = document.getElementById("authButton");
  const badge = document.getElementById("adminBadge");
  const menuRiwayat = document.getElementById("menuRiwayat");
  const menuMonitoring = document.getElementById("menuMonitoring");

  if (!btn || !badge) return;

  if (isAdmin()) {
    btn.innerText = "🚪 Logout";
    btn.style.background =
      "linear-gradient(135deg, #2563eb, #3b82f6)";
    badge.style.display = "block";
    menuRiwayat.style.display = "block";
    menuMonitoring.style.display = "block";
  } else {
    btn.innerText = "🔐 Login Admin";
    btn.style.background =
      "linear-gradient(135deg, #2563eb, #3b82f6)";
    badge.style.display = "none";
    menuRiwayat.style.display = "none";
    menuMonitoring.style.display = "none";
  }
}


// ============================
// LOAD PAGE
// ============================
function loadPage(page) {
  fetch(`pages/${page}.html`)
    .then(res => res.text())
    .then(data => {
      document.getElementById("content").innerHTML = data;

      document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
      });

      const activeMenu = document.querySelector(`[onclick="loadPage('${page}')"]`);
      if (activeMenu) activeMenu.classList.add("active");

      if (page === "data-alat") loadDataAlat();
      if (page === "dashboard") loadDashboard();
      if (page === "monitoring") loadMonitoring();
      if (page === "riwayat") loadRiwayat();

      if (page === "tata-tertib") {
        loadTataTertib();
      }

      if (page === "peminjaman") {
        loadPeminjaman();
      }
    });
}


// ============================
// 🔥 FORMAT TANGGAL + JAM WIT
// ============================
function formatTanggalWIT(dateString) {

  if (!dateString) return "-";

  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  // 🔥 HANDLE FORMAT YYYY-MM-DD
  if (
    typeof dateString === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {

    const parts = dateString.split("-");

    const tahun = parts[0];
    const bulanNum = parseInt(parts[1]) - 1;
    const hari = parts[2];

    return `${hari} ${bulan[bulanNum]} ${tahun}`;
  }

  // 🔥 HANDLE ISO DATE
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "-";
  }

  const utc =
    date.getTime() +
    (date.getTimezoneOffset() * 60000);

  const witDate =
    new Date(utc + (9 * 60 * 60 * 1000));

  const hari =
    witDate.getDate();

  const bulanText =
    bulan[witDate.getMonth()];

  const tahun =
    witDate.getFullYear();

  const jam = String(
    witDate.getHours()
  ).padStart(2, "0");

  const menit = String(
    witDate.getMinutes()
  ).padStart(2, "0");

  const detik = String(
    witDate.getSeconds()
  ).padStart(2, "0");

  return `${hari} ${bulanText} ${tahun}`;
}


// ============================
// 🔥 FORMAT DATE INPUT
// ============================
function formatDateInput(dateString) {

  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "";

  const tahun = date.getFullYear();

  const bulan = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const hari = String(
    date.getDate()
  ).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
}


// ============================
// 🔥 HITUNG MONITORING
// ============================
function getMonitoringStatus(dateString, kondisi) {

  // 🔴 PRIORITAS KONDISI ALAT
  if (kondisi === "Rusak") {
    return {
      text: "🔴 Rusak Berat",
      color: "#ef4444"
    };
  }

  if (kondisi === "Perlu diperbaiki") {
    return {
      text: "🟡 Perlu Tindakan",
      color: "#f59e0b"
    };
  }

  // 🔥 CEK BERDASARKAN TANGGAL
  if (!dateString) {
    return {
      text: "🔴 Belum Dicek",
      color: "#ef4444"
    };
  }

  const lastDate = new Date(dateString);
  const now = new Date();

  const diffTime = now - lastDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays > 90) {
    return {
      text: "🔴 Belum Dicek",
      color: "#ef4444"
    };
  }

  else if (diffDays > 30) {
    return {
      text: "🟡 Perlu Dicek",
      color: "#f59e0b"
    };
  }

  else {
    return {
      text: "🟢 Aman",
      color: "#10b981"
    };
  }
}


// ============================
// 🔥 LOAD DATA ALAT (ROLE SYSTEM)
// ============================
function loadDataAlat() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      
      console.log("DATA MASUK:", data);

      const tableBody = document.getElementById("tableBody");
      tableBody.innerHTML = "";

      const adminBox = document.getElementById("adminActions");
      if (adminBox) {
        adminBox.style.display = isAdmin() ? "block" : "none";
      }

      data.forEach((item, index) => {

        let gambarList = [];

        if (item.gambar_url) {

          gambarList =
            item.gambar_url.split("|||");
        }

        let gambar =
          gambarList.length > 0
            ? gambarList[0]
            : "https://via.placeholder.com/60";

        let badgeKondisi = "";

        if (item.kondisi === "Layak") {
          badgeKondisi = `<span class="badge-layak">${item.kondisi}</span>`;
        } 
        else if (item.kondisi === "Perlu diperbaiki") {
          badgeKondisi = `<span class="badge-perbaiki">${item.kondisi}</span>`;
        } 
        else {
          badgeKondisi = `<span class="badge-rusak">${item.kondisi}</span>`;
        }

        let aksiButton = `
          <button onclick="openModal(
            '${escapeHtml(item.nama_alat)}',
            '${escapeHtml(item.keterangan)}',
            '${item.kondisi}',
            '${item.status}',
            '${item.lokasi}',
            '${item.gambar_url}',
            '${item.tanggal_update}'
          )">Detail</button>
        `;

        if (isAdmin()) {
          aksiButton += `
            <button onclick="openEditModal(
              '${item.id}',
              '${escapeHtml(item.nama_alat)}',
              '${item.jumlah}',
              '${item.kondisi}',
              '${item.status}',
              '${item.lokasi}',
              '${escapeHtml(item.keterangan)}'
            )">Edit</button>
            <button onclick="hapusData('${item.id}')">Hapus</button>
          `;
        }

        let row = `
          <tr>
            <td>${index + 1}</td>
            <td>${item.nama_alat}</td>
            <td>${item.jumlah}</td>
            <td>${badgeKondisi}</td>
            <td>${item.status}</td>
            <td>${item.lokasi}</td>
            <td>

              <img
                src="${gambar}"
                width="60"
                style="cursor:pointer"
                onclick="openImageModal('${item.gambar_url}')"
              >

              </td>
            <td>${aksiButton}</td>
          </tr>
        `;

        tableBody.innerHTML += row;
      });

    })
    .catch(err => {

      console.error("DETAIL ERROR:", err);

      alert(
        "Gagal ambil data dari API\n\n" +
        err.message
      );

    });
}


// ============================
// ➕ MODAL TAMBAH
// ============================
function openTambahModal() {
  document.getElementById("tambahModal").style.display = "block";

  // 🔥 TAMBAHAN
  document.getElementById("modalTitle").innerText = "Tambah Data Alat";
}

function closeTambahModal() {
  document.getElementById("tambahModal").style.display = "none";
}


// ============================
// 🔥 UPLOAD CLOUDINARY
// ============================
async function uploadToCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dalqgi6oq/image/upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "lab_upload");

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
}

async function uploadMultipleToCloudinary(files) {

  const uploadedUrls = [];

  for (const file of files) {

    const url =
      await uploadToCloudinary(file);

    uploadedUrls.push(url);
  }

  return uploadedUrls;
}


// ============================
// 🖼️ PREVIEW GAMBAR UPLOAD
// ============================
function previewGambarMulti() {

  const fileInput =
    document.getElementById("t_gambar");

  const container =
    document.getElementById("multiPreviewContainer");

  container.innerHTML = "";

  const files = fileInput.files;

  if (!files.length) return;

  Array.from(files).forEach(file => {

    const reader = new FileReader();

    reader.onload = function(e) {

      container.innerHTML += `
        <div class="multi-preview-item">

          <img src="${e.target.result}">

        </div>
      `;
    };

    reader.readAsDataURL(file);

  });
}


// ============================
// ➕ TAMBAH DATA (FIXED NO PREFLIGHT)
// ============================
async function tambahData() {

  const nama = document.getElementById("t_nama").value.trim();

  let jumlah = document.getElementById("t_jumlah").value.trim();

  if (jumlah === "") {
    jumlah = " ";
  }

  const files =
    document.getElementById("t_gambar").files;

  if (!nama) {
    alert("Nama alat wajib diisi!");
    return;
  }

  showLoading("Sedang menyimpan data...");

  let imageUrl = "";

  if (files.length > 0) {

    try {

      const uploadedImages =
        await uploadMultipleToCloudinary(files);

    imageUrl =
      uploadedImages.join("|||");

    } catch (err) {

      alert("Gagal upload gambar");

      return;
    }
  }

  const params = new URLSearchParams();

  const id = document.getElementById("tambahModal").getAttribute("data-id");

  if (id) {
    params.append("action", "edit");
    params.append("id", id);
  } else {
    params.append("action", "tambah");
  }

  params.append("nama_alat", nama);
  params.append("jumlah", jumlah);
  params.append("kondisi", document.getElementById("t_kondisi").value);
  params.append("status", document.getElementById("t_status").value);
  params.append("lokasi", document.getElementById("t_lokasi").value);
  params.append("keterangan", document.getElementById("t_keterangan").value);
  params.append("gambar_url", imageUrl);

  fetch(API_URL, {
    method: "POST",
    body: params
  })
  .then(res => res.json())
  .then(res => {

    if (res.status === "success") {
      
      hideLoading();

      if (id) {
        alert("Data berhasil diupdate");
      } else {
        alert("Data berhasil ditambahkan");
      }

      closeTambahModal();
      loadDataAlat();

      document.getElementById("t_nama").value = "";
      document.getElementById("t_jumlah").value = "";
      document.getElementById("t_lokasi").value = "";
      document.getElementById("t_keterangan").value = "";
      document.getElementById("t_gambar").value = "";
      document.getElementById("multiPreviewContainer").innerHTML = "";

      // ✅ DI SINI (PALING BAWAH DALAM IF SUCCESS)
      document.getElementById("tambahModal").removeAttribute("data-id");
    
    } else {

      hideLoading();

      alert("Gagal simpan data");
    }

  })
  .catch(err => {
    hideLoading();
    console.error(err);
    alert("Error kirim data");
  });
}


// ============================
// ❌ CLOSE MODAL
// ============================
function closeModal() {
  document.getElementById("modal").style.display = "none";
}


// ============================
// 🖼️ OPEN MODAL FOTO
// ============================
let galleryImages = [];
let currentGalleryIndex = 0;

function openImageModal(gambar) {

  document.getElementById("imageModal").style.display = "flex";

  galleryImages =
    gambar
      ? gambar.split("|||")
      : [];

  currentGalleryIndex = 0;

  document.getElementById("previewImage").src =
    galleryImages[0] || "";

  window.currentImage =
    galleryImages[0] || "";

  const thumbContainer =
    document.getElementById("fullscreenThumbnailContainer");

  thumbContainer.innerHTML = "";

  galleryImages.forEach((img, index) => {

    thumbContainer.innerHTML += `
      <img
        src="${img}"
        class="fullscreen-thumb"
        onclick="setFullscreenImage(${index})"
      >
    `;
  });
}

function setFullscreenImage(index) {

  currentGalleryIndex = index;

  document.getElementById("previewImage").src =
    galleryImages[index];

  window.currentImage =
    galleryImages[index];
}


function nextImage() {

  if (galleryImages.length === 0) return;

  currentGalleryIndex++;

  if (currentGalleryIndex >= galleryImages.length) {
    currentGalleryIndex = 0;
  }

  setFullscreenImage(currentGalleryIndex);
}


function prevImage() {

  if (galleryImages.length === 0) return;

  currentGalleryIndex--;

  if (currentGalleryIndex < 0) {
    currentGalleryIndex = galleryImages.length - 1;
  }

  setFullscreenImage(currentGalleryIndex);
}


// ============================
// ❌ CLOSE MODAL FOTO
// ============================
function closeImageModal() {
  document.getElementById("imageModal").style.display = "none";
}


// ============================
// ⬇️ DOWNLOAD GAMBAR (FIX)
// ============================
async function downloadImage() {
  const url = window.currentImage;

  try {
    const res = await fetch(url);
    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gambar.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    alert("Gagal download gambar");
  }
}


// ============================
// Klik luar modal = tutup
// ============================
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  const loginModal = document.getElementById("loginModal");
  const tambahModal = document.getElementById("tambahModal");
  const imageModal = document.getElementById("imageModal");
  const peminjamanModal = document.getElementById("peminjamanModal");

  if (event.target == modal) modal.style.display = "none";
  if (event.target == loginModal) loginModal.style.display = "none";
  if (event.target == tambahModal) tambahModal.style.display = "none";
  if (event.target == imageModal) imageModal.style.display = "none";
  if (event.target == peminjamanModal) peminjamanModal.style.display = "none";
};


// ============================
// 🔥 SHOW LOADING
// ============================
function showLoading(text = "Sedang menyimpan data...") {

  const overlay = document.getElementById("loadingOverlay");

  if (!overlay) return;

  overlay.style.display = "flex";

  const loadingText = document.getElementById("loadingText");

  if (loadingText) {
    loadingText.innerText = text;
  }
}


// ============================
// 🔥 HIDE LOADING
// ============================
function hideLoading() {

  const overlay = document.getElementById("loadingOverlay");

  if (!overlay) return;

  overlay.style.display = "none";
}



// ============================
// 🔥 AMANIN TEXT
// ============================
function escapeHtml(text) {

  if (text === null || text === undefined)
    return "";

  text = String(text);

  return text
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;");
}


function openModal(nama, fungsi, kondisi, status, lokasi, gambar, tanggal) {

  document.getElementById("modal").style.display = "block";

  document.getElementById("modalNama").innerText = nama;
  document.getElementById("modalFungsi").innerText = fungsi || "-";
  document.getElementById("modalKondisi").innerText = kondisi;
  document.getElementById("modalStatus").innerText = status;
  document.getElementById("modalLokasi").innerText = lokasi;

  const images =
    gambar
      ? gambar.split("|||")
      : [];

  document.getElementById("modalImage").src =
    images[0] || "";

  const thumbnailContainer =
    document.getElementById("modalThumbnailContainer");

  thumbnailContainer.innerHTML = "";

  images.forEach(img => {

    thumbnailContainer.innerHTML += `
      <img
        src="${img}"
        class="modal-thumb"
        onclick="changeModalImage('${img}')"
      >
    `;
  });

  document.getElementById("modalTanggal").innerText = formatTanggalWIT(tanggal);

  const monitoring = getMonitoringStatus(tanggal, kondisi);
  const el = document.getElementById("modalMonitoring");

  el.innerText = monitoring.text;
  el.style.color = monitoring.color;
}


function openEditModal(id, nama, jumlah, kondisi, status, lokasi, keterangan) {

  document.getElementById("tambahModal").style.display = "block";

  document.getElementById("modalTitle").innerText = "Edit Data Alat";

  document.getElementById("t_nama").value = nama;
  document.getElementById("t_jumlah").value = jumlah;
  document.getElementById("t_kondisi").value = kondisi;
  document.getElementById("t_status").value = status;
  document.getElementById("t_lokasi").value = lokasi;
  document.getElementById("t_keterangan").value = keterangan;

  document.getElementById("tambahModal").setAttribute("data-id", id);
}


function hapusData(id) {

  if (!confirm("Yakin mau hapus data ini?")) return;

  const params = new URLSearchParams();
  params.append("action", "hapus");
  params.append("id", id);

  fetch(API_URL, {
    method: "POST",
    body: params
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "success") {
      alert("Data berhasil dihapus");
      loadDataAlat();
    } else {
      alert("Gagal hapus data");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error hapus data");
  });
}


// ============================
// 📊 LOAD DASHBOARD (BARU)
// ============================
function loadDashboard() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {

      let total = data.length;
      let layak = 0;
      let rusak = 0;
      let perbaiki = 0;

      data.forEach(item => {
        if (item.kondisi === "Layak") {
          layak++;
        } 
        else if (item.kondisi === "Perlu diperbaiki") {
          perbaiki++;
        } 
        else {
          rusak++;
        }
      });

      // isi ke dashboard
      document.getElementById("totalAlat").innerText = total;
      document.getElementById("alatLayak").innerText = layak;
      document.getElementById("alatPerbaiki").innerText = perbaiki;
      document.getElementById("alatRusak").innerText = rusak;

    })
    .catch(err => {
      console.error("Error dashboard:", err);
    });
}


// ============================
// 🔥 LOAD RIWAYAT
// ============================
function loadRiwayat() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {

      const body = document.getElementById("riwayatBody");
      if (!body) return;

      body.innerHTML = "";

      data.forEach((item, index) => {

        let perubahan = "";

        if (item.kondisi === "Layak") {
          perubahan = "Kondisi Layak";
        } 
        else if (item.kondisi === "Perlu diperbaiki") {
          perubahan = "Perlu diperbaiki";
        } 
        else {
          perubahan = "Rusak";
        }

        let row = `
          <tr>
            <td>${index + 1}</td>
            <td>${formatTanggalWIT(item.tanggal_update)}</td>
            <td>${item.nama_alat}</td>
            <td>${perubahan}</td>
          </tr>
        `;

        body.innerHTML += row;
      });

    })
    .catch(err => {
      console.error(err);
      alert("Gagal load riwayat");
    });
}


let monitoringData = [];


// ============================
// 🔥 LOAD MONITORING
// ============================
function loadMonitoring() {

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {

      monitoringData = data;

      renderMonitoringTable(data);

    })
    .catch(err => {

      console.error(err);

      alert("Gagal load monitoring");

    });
}


// ============================
// 🔥 RENDER TABLE
// ============================
function renderMonitoringTable(data) {

  const body =
    document.getElementById("monitoringBody");

  if (!body) return;

  body.innerHTML = "";

  data.forEach((item, index) => {

    const monitoring =
      getMonitoringStatus(
        item.tanggal_update,
        item.kondisi
      );

    let badge = "";

    if (monitoring.text.includes("Aman")) {

      badge = `
        <span class="badge-layak">
          ${monitoring.text}
        </span>
      `;
    }

    else if (
      monitoring.text.includes("Perlu")
    ) {

      badge = `
        <span class="badge-perbaiki">
          ${monitoring.text}
        </span>
      `;
    }

    else {

      badge = `
        <span class="badge-rusak">
          ${monitoring.text}
        </span>
      `;
    }

    body.innerHTML += `
      <tr>

        <td>${index + 1}</td>

        <td>${item.nama_alat}</td>

        <td>${item.kondisi}</td>

        <td>${item.status}</td>

        <td>
          ${formatTanggalWIT(item.tanggal_update)}
        </td>

        <td>${badge}</td>

      </tr>
    `;
  });
}


// ============================
// 🔥 FILTER MONITORING
// ============================
function filterMonitoring(type, element) {

  document
    .querySelectorAll(".monitor-box")
    .forEach(box => {
      box.classList.remove("active");
    });

  element.classList.add("active");

  if (type === "all") {

    renderMonitoringTable(monitoringData);

    return;
  }

  const filtered = monitoringData.filter(item => {

    const monitoring =
      getMonitoringStatus(
        item.tanggal_update,
        item.kondisi
      );

    if (
      type === "aman" &&
      monitoring.text.includes("Aman")
    ) {
      return true;
    }

    if (
      type === "perlu" &&
      monitoring.text.includes("Perlu")
    ) {
      return true;
    }

    if (
      type === "rusak" &&
      monitoring.text.includes("Rusak")
    ) {
      return true;
    }

    return false;
  });

  renderMonitoringTable(filtered);
}


// ============================
// 📘 LOAD TATA TERTIB
// ============================
function loadTataTertib() {

  const body =
    document.getElementById("tataTertibBody");

  const empty =
    document.getElementById("tataEmptyState");

  const adminAction =
    document.getElementById("tataTertibAdminAction");

  const aksiHeader =
    document.getElementById("tataAksiHeader");

  if (!body) return;

  body.innerHTML = "";

  // 🔥 ADMIN ONLY
  if (isAdmin()) {

    if (adminAction)
      adminAction.style.display = "block";

    if (aksiHeader)
      aksiHeader.style.display = "table-cell";

  }

  else {

    if (adminAction)
      adminAction.style.display = "none";

    if (aksiHeader)
      aksiHeader.style.display = "none";
  }

  // 🔥 AMBIL DATA DARI GAS
  fetch(API_URL + "?action=getTataTertib")

    .then(res => res.json())

    .then(data => {

      // 🔥 EMPTY
      if (data.length === 0) {

        empty.style.display = "block";

        return;
      }

      empty.style.display = "none";

      data.forEach((item, index) => {

    let aksi = "";

    if (isAdmin()) {

      aksi = `
        <td class="tata-aksi">

          <button onclick="editTataTertib('${item.id}', \`${item.tata_tertib}\`)">
            Edit
          </button>

          <button
            class="action-delete"
            onclick="hapusTataTertib('${item.id}')">

            Hapus

          </button>

        </td>
      `;
    }

    body.innerHTML += `
      <tr>

        <td>${index + 1}</td>

        <td>
          ${item.tata_tertib}
        </td>

        ${aksi}

      </tr>
    `;
  });

})

  .catch(err => {

    console.error(err);

    alert("Gagal load tata tertib");

  });
}


// ============================
// ➕ TAMBAH TATA TERTIB
// ============================
function openTambahTataTertib() {

  const aturan =
    prompt("Masukkan tata tertib:");

  if (!aturan) return;

  const params = new URLSearchParams();

  params.append(
    "action",
    "tambahTataTertib"
  );

  params.append(
    "tata_tertib",
    aturan
  );

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Tata tertib berhasil ditambahkan");

      loadTataTertib();

    } else {

      alert("Gagal tambah tata tertib");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error tambah tata tertib");

  });
}


// ============================
// ✏️ EDIT TATA TERTIB
// ============================
function editTataTertib(id, isiLama) {

  const aturanBaru =
    prompt(
      "Edit tata tertib:",
      isiLama
    );

  if (!aturanBaru) return;

  const params = new URLSearchParams();

  params.append(
    "action",
    "editTataTertib"
  );

  params.append("id", id);

  params.append(
    "tata_tertib",
    aturanBaru
  );

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Tata tertib berhasil diupdate");

      loadTataTertib();

    } else {

      alert("Gagal update tata tertib");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error update tata tertib");

  });
}


// ============================
// ❌ HAPUS TATA TERTIB
// ============================
function hapusTataTertib(id) {

  if (!confirm(
    "Yakin ingin menghapus tata tertib ini?"
  )) return;

  const params = new URLSearchParams();

  params.append(
    "action",
    "hapusTataTertib"
  );

  params.append("id", id);

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Tata tertib berhasil dihapus");

      loadTataTertib();

    } else {

      alert("Gagal hapus tata tertib");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error hapus tata tertib");

  });
}


// ============================
// 🔍 SEARCH DATA ALAT
// ============================
function searchDataAlat() {

  const keyword =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();

  const rows =
    document.querySelectorAll("#tableBody tr");

  rows.forEach(row => {

    const text =
      row.innerText.toLowerCase();

    if (text.includes(keyword)) {

      row.style.display = "";

    } else {

      row.style.display = "none";

    }

  });
}


function changeModalImage(url) {

  document.getElementById("modalImage").src =
    url;
}


// ============================
// 📦 LOAD PEMINJAMAN
// ============================
function loadPeminjaman() {

  const body =
    document.getElementById("peminjamanBody");

  const adminAction =
    document.getElementById("peminjamanAdminAction");

  const aksiHeader =
    document.getElementById("peminjamanAksiHeader");

  if (!body) return;

  // 🔥 ADMIN ONLY
  if (isAdmin()) {

    adminAction.style.display = "block";

    if (aksiHeader)
      aksiHeader.style.display = "table-cell";

  } else {

    adminAction.style.display = "none";

    if (aksiHeader)
      aksiHeader.style.display = "none";
  }

  fetch(API_URL + "?action=getPeminjaman")

    .then(res => res.json())

    .then(data => {

      body.innerHTML = "";

      // 🔥 KOSONG
      if (data.length === 0) {

        body.innerHTML = `
          <tr>
            <td colspan="9" style="
              text-align:center;
              padding:30px;
            ">
              Belum ada data peminjaman
            </td>
          </tr>
        `;

        return;
      }

      data.forEach((item, index) => {

        let aksi = "";

        if (isAdmin()) {

          aksi = `
            <td>

              <button
                onclick="editPeminjaman(
                  '${item.id}',
                  '${escapeHtml(item.nama_peminjam)}',
                  '${escapeHtml(item.nama_alat)}',
                  '${item.jumlah}',
                  '${item.tanggal_pinjam}',
                  '${item.tanggal_kembali}',
                  '${item.status}',
                  '${escapeHtml(item.keperluan)}'
              )">
                Edit
              </button>

              <button 
                onclick="hapusPeminjaman('${item.id}')">
                Hapus
              </button>

            </td>
          `;
        }

        body.innerHTML += `
          <tr>

            <td>${index + 1}</td>

            <td>${item.nama_peminjam}</td>

            <td>${item.nama_alat}</td>

            <td>${item.jumlah}</td>

            <td>${formatTanggalWIT(item.tanggal_pinjam)}</td>

            <td>
              ${
                item.tanggal_kembali
                  ? formatTanggalWIT(item.tanggal_kembali)
                  : "-"
              }
            </td>

            <td>${item.status}</td>

            <td>${item.keperluan}</td>

            ${aksi}

          </tr>
        `;
      });

    })

    .catch(err => {

      console.error(err);

      alert("Gagal load data peminjaman");

    });
}


// ============================
// 📦 OPEN MODAL PEMINJAMAN
// ============================
function openTambahPeminjaman() {

  document.getElementById("peminjamanModal")
    .style.display = "block";

  // 🔥 RESET TITLE
  document.querySelector("#peminjamanModal h2")
    .innerText = "Tambah Peminjaman";

  // 🔥 RESET FORM
  document.getElementById("p_id").value = "";

  document.getElementById("p_nama").value = "";

  document.getElementById("p_alat").value = "";

  document.getElementById("p_jumlah").value = "";

  document.getElementById("p_tanggal_pinjam").value = "";

  document.getElementById("p_tanggal_kembali").value = "";

  document.getElementById("p_status").value = "Dipinjam";

  document.getElementById("p_keperluan").value = "";

  // 🔥 RESET BUTTON
  const btn =
    document.querySelector(
      "#peminjamanModal button"
    );

  btn.innerText = "Simpan";

  btn.setAttribute(
    "onclick",
    "tambahPeminjaman()"
  );
}


// ============================
// ❌ CLOSE MODAL PEMINJAMAN
// ============================
function closePeminjamanModal() {

  document.getElementById("peminjamanModal")
    .style.display = "none";
}


// ============================
// 📦 TAMBAH PEMINJAMAN
// ============================
function tambahPeminjaman() {

  const params = new URLSearchParams();

  params.append("action", "tambahPeminjaman");

  params.append(
    "nama_peminjam",
    document.getElementById("p_nama").value
  );

  params.append(
    "nama_alat",
    document.getElementById("p_alat").value
  );

  params.append(
    "jumlah",
    document.getElementById("p_jumlah").value
  );

  params.append(
    "tanggal_pinjam",
    document.getElementById("p_tanggal_pinjam").value
  );

  params.append(
    "tanggal_kembali",
    ""
  );

  params.append(
    "status",
    document.getElementById("p_status").value
  );

  params.append(
    "keperluan",
    document.getElementById("p_keperluan").value
  );

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Peminjaman berhasil ditambahkan");

      closePeminjamanModal();

      loadPeminjaman();

    } else {

      alert("Gagal tambah peminjaman");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error tambah peminjaman");

  });
}


// ============================
// ✏️ EDIT PEMINJAMAN
// ============================
function editPeminjaman(
  id,
  nama,
  alat,
  jumlah,
  tanggalPinjam,
  tanggalKembali,
  status,
  keperluan
) {

  document.getElementById("peminjamanModal")
    .style.display = "block";

  // 🔥 TITLE
  document.querySelector("#peminjamanModal h2")
    .innerText = "Edit Peminjaman";

  // 🔥 ISI FORM
  document.getElementById("p_id").value = id;

  document.getElementById("p_nama").value = nama;

  document.getElementById("p_alat").value = alat;

  document.getElementById("p_jumlah").value = jumlah;

  document.getElementById("p_tanggal_pinjam").value =
    formatDateInput(tanggalPinjam);

  document.getElementById("p_tanggal_kembali").value =
    formatDateInput(tanggalKembali);

  document.getElementById("p_status").value = status;

  document.getElementById("p_keperluan").value = keperluan;

  // 🔥 GANTI BUTTON
  const btn =
    document.querySelector(
      "#peminjamanModal button"
    );

  btn.innerText = "Update";

  btn.setAttribute(
    "onclick",
    "updatePeminjaman()"
  );
}


function updatePeminjaman() {

  const params = new URLSearchParams();

  params.append(
    "action",
    "editPeminjaman"
  );

  params.append(
    "id",
    document.getElementById("p_id").value
  );

  // 🔥 TAMBAHAN WAJIB
  params.append(
    "nama_peminjam",
    document.getElementById("p_nama").value
  );

  params.append(
    "nama_alat",
    document.getElementById("p_alat").value
  );

  params.append(
    "jumlah",
    document.getElementById("p_jumlah").value
  );

  params.append(
    "tanggal_pinjam",
    document.getElementById("p_tanggal_pinjam").value
  );

  params.append(
    "tanggal_kembali",
    document.getElementById("p_tanggal_kembali").value
  );

  params.append(
    "status",
    document.getElementById("p_status").value
  );

  params.append(
    "keperluan",
    document.getElementById("p_keperluan").value
  );

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Peminjaman berhasil diupdate");

      closePeminjamanModal();

      loadPeminjaman();

    } else {

      alert("Gagal update peminjaman");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error update peminjaman");

  });
}


// ============================
// ❌ HAPUS PEMINJAMAN
// ============================
function hapusPeminjaman(id) {

  if (!confirm("Yakin hapus data peminjaman ini?"))
    return;

  const params = new URLSearchParams();

  params.append(
    "action",
    "hapusPeminjaman"
  );

  params.append("id", id);

  fetch(API_URL, {
    method: "POST",
    body: params
  })

  .then(res => res.json())

  .then(res => {

    if (res.status === "success") {

      alert("Data peminjaman berhasil dihapus");

      loadPeminjaman();

    } else {

      alert("Gagal hapus data");

    }

  })

  .catch(err => {

    console.error(err);

    alert("Error hapus peminjaman");

  });
}


// ============================
// 🔥 AUTO CHECK ADMIN SAAT LOAD
// ============================
window.onload = function() {
  updateAdminUI();
};