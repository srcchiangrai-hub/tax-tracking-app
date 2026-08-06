import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ✅ Firebase Config จริงของคุณฝังเรียบร้อยแล้ว
const firebaseConfig = {
  apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// 1. Initial Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ==========================================
// 📌 2. ทำงานฝั่ง Dashboard (index.html)
// ==========================================
const tbody = document.getElementById("dataTable");
if (tbody) {
  const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
  
  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-slate-400">ยังไม่มีข้อมูลในระบบ</td></tr>`;
      return;
    }

    let html = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const dateStr = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString('th-TH') : '-';
      
      html += `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="p-3 text-xs text-slate-500">${dateStr}</td>
          <td class="p-3 font-bold text-slate-700">${data.fullName || '-'}</td>
          <td class="p-3">${data.taxType || '-'}</td>
          <td class="p-3 font-semibold text-pink-600">${(data.taxAmount || 0).toLocaleString()}</td>
          <td class="p-3"><span class="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">${data.followResult || '-'}</span></td>
          <td class="p-3">
            ${data.photoUrl ? `<a href="${data.photoUrl}" target="_blank" class="text-xs text-purple-600 underline font-bold">🖼️ ดูรูปภาพ</a>` : '<span class="text-slate-300">-</span>'}
          </td>
          <td class="p-3 text-xs text-slate-500">${data.reporterName || '-'}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }, (err) => {
    console.error("Firestore Error:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center p-6 text-rose-500">❌ ดึงข้อมูลไม่สำเร็จ (ติดปัญหา Security Rules)</td></tr>`;
  });
}

// ==========================================
// 📌 3. ทำงานฝั่ง เจ้าหน้าที่ (admin.html)
// ==========================================
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const taxForm = document.getElementById("taxForm");

// เช็กสถานะล็อกอิน
if (loginSection && adminSection) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginSection.classList.add("hidden");
      adminSection.classList.remove("hidden");
      const userStatusText = document.getElementById("userStatusText");
      if (userStatusText) userStatusText.innerText = `ผู้ใช้งาน: ${user.email}`;
    } else {
      loginSection.classList.remove("hidden");
      adminSection.classList.add("hidden");
    }
  });
}

// ระบบเข้าสู่ระบบ
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;
    const btnLogin = document.getElementById("btnLogin");

    try {
      btnLogin.disabled = true;
      btnLogin.innerText = "⏳ กำลังเข้าสู่ระบบ...";
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      alert("❌ เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerText = "🔑 เข้าสู่ระบบ";
    }
  });
}

// ออกจากระบบ
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) signOut(auth);
  });
}

// ดึง GPS
const btnGetLocation = document.getElementById("btnGetLocation");
if (btnGetLocation) {
  btnGetLocation.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { 
          document.getElementById("location").value = `${pos.coords.latitude}, ${pos.coords.longitude}`; 
        },
        (err) => alert("ไม่สามารถดึงพิกัด GPS ได้: " + err.message)
      );
    } else {
      alert("อุปกรณ์นี้ไม่รองรับ Geolocation");
    }
  });
}

// บันทึกฟอร์มข้อมูล
if (taxForm) {
  taxForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById("btnSubmit");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ กำลังบันทึกข้อมูล...";

    try {
      let photoUrl = "";
      const photoFile = document.getElementById("photoInput").files[0];

      // อัปโหลดรูปภาพเข้า Firebase Storage
      if (photoFile) {
        try {
          const cleanFileName = photoFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
          const storageRef = ref(storage, `photos/${Date.now()}_${cleanFileName}`);
          const uploadResult = await uploadBytes(storageRef, photoFile);
          photoUrl = await getDownloadURL(uploadResult.ref);
        } catch (imgErr) {
          console.warn("ไม่สามารถอัปโหลดรูปภาพได้:", imgErr);
          alert("⚠️ คำเตือน: อัปโหลดรูปไม่สำเร็จ แต่ระบบจะบันทึกข้อความต่อไป");
        }
      }

      // โครงสร้างข้อมูลจัดเก็บ
      const payload = {
        fullName: document.getElementById("fullName").value,
        taxId: document.getElementById("taxId").value,
        taxType: document.getElementById("taxType").value,
        taxAmount: Number(document.getElementById("taxAmount").value) || 0,
        address: {
          houseNo: document.getElementById("houseNo").value,
          soi: document.getElementById("soi").value,
          road: document.getElementById("road").value,
          district: document.getElementById("district").value,
          province: document.getElementById("province").value
        },
        followResult: document.getElementById("followResult").value,
        docType: document.getElementById("docType").value,
        otherDetail: document.getElementById("otherDetail").value,
        photoUrl: photoUrl,
        reporterName: document.getElementById("reporterName").value,
        reporterPosition: document.getElementById("reporterPosition").value,
        location: document.getElementById("location").value,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "tax_records"), payload);
      alert("✅ บันทึกข้อมูลเรียบร้อยแล้ว!");
      taxForm.reset();
    } catch (err) {
      alert("❌ เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "💾 บันทึกข้อมูลเข้าระบบ";
    }
  });
}
