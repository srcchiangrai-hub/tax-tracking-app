import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 1. ใส่ค่า firebaseConfig จากคอนโซล Firebase ของคุณที่นี่
const firebaseConfig = {
    apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// 🔴 2. URL Google Apps Script สำหรับเก็บรูปบน Google Drive
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyU75Glrqy6VFhzvhQB8DZRIGuFYvJJm95ppbOMq7bk35w90gKl47h86ChG8ZettT2gg/exec

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let rawDataList = [];

// --- 1. ตรวจสอบสถานะการล็อกอิน Firebase Authentication ---
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const userInfo = document.getElementById('userInfo');
    const btnLogout = document.getElementById('btnLogout');

    if (user) {
        if (loginSection) loginSection.style.display = 'none';
        if (adminSection) adminSection.style.display = 'block';
        if (userInfo) { 
            userInfo.style.display = 'inline-block'; 
            userInfo.innerText = `👤 ${user.email}`; 
        }
        if (btnLogout) btnLogout.style.display = 'inline-block';
    } else {
        if (loginSection) loginSection.style.display = 'flex';
        if (adminSection) adminSection.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'none';
    }
});

// --- 2. ระบบ Login ยืนยันไอดีผ่าน Firebase Auth ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btnLoginSubmit = document.getElementById('btnLoginSubmit');

        try {
            btnLoginSubmit.disabled = true;
            btnLoginSubmit.innerText = "⏳ กำลังตรวจสอบไอดี...";

            // ส่งอีเมล/รหัสผ่านไปตรวจสอบที่ Firebase Auth
            await signInWithEmailAndPassword(auth, email, password);
            alert("✅ เข้าสู่ระบบสำเร็จ!");
            loginForm.reset();
        } catch (error) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                alert("❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบไอดีใน Firebase Authentication");
            } else {
                alert("❌ เข้าสู่ระบบไม่สำเร็จ: " + error.message);
            }
        } finally {
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.innerText = "🚀 เข้าสู่ระบบ";
        }
    });
}

// ระบบ Logout
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        if (confirm("ต้องการออกจากระบบหรือไม่?")) {
            await signOut(auth);
            alert("👋 ออกจากระบบเรียบร้อย");
        }
    });
}

// --- 3. ฟังก์ชัน GPS & แปลงไฟล์ภาพ ---
const btnGetGPS = document.getElementById('btnGetGPS');
if (btnGetGPS) {
    btnGetGPS.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                document.getElementById('lat').value = pos.coords.latitude.toFixed(6);
                document.getElementById('lng').value = pos.coords.longitude.toFixed(6);
                alert("📍 ดึงพิกัด GPS สำเร็จ!");
            }, (err) => alert("❌ ไม่สามารถดึงพิกัดได้: " + err.message));
        } else {
            alert("❌ เบราว์เซอร์นี้ไม่รองรับ GPS");
        }
    });
}

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// --- 4. บันทึกข้อมูลเข้า Firestore & ส่งรูปไป Drive ---
const taxForm = document.getElementById('taxForm');
if (taxForm) {
    taxForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = document.getElementById('btnSubmit');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "⏳ กำลังบันทึกข้อมูล...";

        try {
            const imageFile = document.getElementById('imageFile').files[0];
            let imageUrl = "";

            if (imageFile) {
                btnSubmit.innerHTML = "⏳ อัปโหลดรูปภาพเข้า Google Drive...";
                const base64Data = await fileToBase64(imageFile);
                const res = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        fileName: `${Date.now()}_${imageFile.name}`,
                        mimeType: imageFile.type,
                        fileData: base64Data
                    })
                });
                const result = await res.json();
                if (result.status === "success") imageUrl = result.url;
            }

            await addDoc(collection(db, "tax_records"), {
                taxType: document.getElementById('taxType').value,
                taxId: document.getElementById('taxId').value,
                landCode: document.getElementById('landCode').value,
                name: document.getElementById('name').value,
                houseNo: document.getElementById('houseNo').value,
                moo: document.getElementById('moo').value,
                alley: document.getElementById('alley').value,
                road: document.getElementById('road').value,
                subDistrict: document.getElementById('subDistrict').value,
                district: document.getElementById('district').value,
                province: document.getElementById('province').value,
                zipcode: document.getElementById('zipcode').value,
                lat: document.getElementById('lat').value,
                lng: document.getElementById('lng').value,
                docType: document.getElementById('docType').value,
                taxYear: document.getElementById('taxYear').value,
                amount: parseFloat(document.getElementById('amount').value || 0),
                followStatus: document.getElementById('followStatus').value,
                actionTaken: document.getElementById('actionTaken').value,
                remark: document.getElementById('remark').value,
                officerName: document.getElementById('officerName').value,
                officerPosition: document.getElementById('officerPosition').value,
                imageUrl: imageUrl,
                createdAt: serverTimestamp()
            });

            alert("✅ บันทึกข้อมูลเรียบร้อย!");
            taxForm.reset();
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาด: " + err.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "💾 บันทึกข้อมูลเข้าฐานข้อมูล";
        }
    });
}

// --- 5. ดึงข้อมูลแบบ Realtime & พิมพ์ ---
const dataTable = document.getElementById('dataTable');
const dashboardTable = document.getElementById('dashboardTable');

if (dataTable || dashboardTable) {
    const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        rawDataList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderData();
    });
}

function renderData() {
    let filtered = [...rawDataList];
    const searchText = document.getElementById('searchInput')?.value.toLowerCase().trim() || "";

    if (searchText) {
        filtered = filtered.filter(i => 
            (i.name && i.name.toLowerCase().includes(searchText)) ||
            (i.taxId && i.taxId.includes(searchText)) ||
            (i.subDistrict && i.subDistrict.toLowerCase().includes(searchText))
        );
    }

    if (dataTable) {
        dataTable.innerHTML = filtered.map(item => `
            <tr>
                <td><strong>${item.name}</strong><br><small class="text-muted">${item.taxType}</small></td>
                <td class="text-end fw-bold text-danger">${(item.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-light border print-single-btn" data-id="${item.id}">🖨️ พิมพ์</button>
                </td>
            </tr>
        `).join('');
    }

    if (dashboardTable) {
        let total = 0;
        let success = 0;
        
        dashboardTable.innerHTML = filtered.map(item => {
            total += (item.amount || 0);
            if(item.actionTaken?.includes("ยินยอม")) success++;
            
            return `
                <tr>
                    <td><small>${item.createdAt ? new Date(item.createdAt.seconds*1000).toLocaleDateString('th-TH') : '-'}</small></td>
                    <td><strong>${item.name}</strong><br><small class="text-muted">ID: ${item.taxId}</small></td>
                    <td><span class="badge bg-info text-dark">${item.taxType}</span></td>
                    <td class="text-end fw-bold text-danger">${(item.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td><span class="badge bg-warning text-dark">${item.followStatus}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-dark print-single-btn" data-id="${item.id}">🖨️ พิมพ์</button>
                        ${item.imageUrl ? `<a href="${item.imageUrl}" target="_blank" class="btn btn-sm btn-outline-primary ms-1">🖼️ Drive</a>` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        if (document.getElementById('totalAmount')) document.getElementById('totalAmount').innerText = `${total.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท`;
        if (document.getElementById('totalCount')) document.getElementById('totalCount').innerText = `${filtered.length} รายการ`;
        if (document.getElementById('successCount')) document.getElementById('successCount').innerText = `${success} รายการ`;
    }

    document.querySelectorAll('.print-single-btn').forEach(btn => {
        btn.addEventListener('click', (e) => printSingle(e.target.dataset.id));
    });
}

function printSingle(id) {
    const item = rawDataList.find(i => i.id === id);
    if (!item) return;

    const area = document.getElementById('printableArea');
    area.innerHTML = `
        <div style="font-family: 'Kanit', sans-serif; padding: 20px; line-height: 1.6;">
            <h3 style="text-align: center; font-weight: bold;">รายงานผลการออกติดตามภาษีท้องถิ่น</h3>
            <hr>
            <p><strong>ประเภทภาษี:</strong> ${item.taxType} (ปี ${item.taxYear})</p>
            <p><strong>ชื่อผู้เสียภาษี:</strong> ${item.name} (เลขประจำตัว: ${item.taxId})</p>
            <p><strong>ที่อยู่ติดตาม:</strong> บ้านเลขที่ ${item.houseNo} หมู่ ${item.moo || '-'} ต.${item.subDistrict} อ.${item.district} จ.${item.province}</p>
            <p><strong>เอกสารนำส่ง:</strong> ${item.docType}</p>
            <p><strong>ยอดภาษีค้างชำระ:</strong> ${(item.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})} บาท</p>
            <p><strong>ผลการติดตาม:</strong> ${item.followStatus}</p>
            <p><strong>แนวโน้มการชำระ:</strong> ${item.actionTaken}</p>
            <p><strong>หมายเหตุ:</strong> ${item.remark || '-'}</p>
            <br><br>
            <div style="float: right; text-align: center;">
                <p>ลงชื่อ........................................................</p>
                <p>(${item.officerName})</p>
                <p>ตำแหน่ง ${item.officerPosition}</p>
            </div>
        </div>
    `;
    area.style.display = 'block';
    window.print();
    area.style.display = 'none';
}

const printAll = () => {
    const area = document.getElementById('printableArea');
    area.innerHTML = `
        <h3 style="text-align:center;">รายงานสรุปการออกติดตามภาษีทั้งหมด</h3>
        <table border="1" style="width:100%; border-collapse:collapse; margin-top:20px; font-size:12px;">
            <thead>
                <tr>
                    <th>ชื่อผู้เสียภาษี</th>
                    <th>ประเภทภาษี</th>
                    <th>เอกสาร</th>
                    <th>ยอดค้าง (บาท)</th>
                    <th>ผลการติดตาม</th>
                </tr>
            </thead>
            <tbody>
                ${rawDataList.map(i => `
                    <tr>
                        <td>${i.name}</td>
                        <td>${i.taxType}</td>
                        <td>${i.docType}</td>
                        <td style="text-align:right;">${(i.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                        <td>${i.followStatus}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    area.style.display = 'block';
    window.print();
    area.style.display = 'none';
};

document.getElementById('btnPrintAll')?.addEventListener('click', printAll);
document.getElementById('btnPrintDashboard')?.addEventListener('click', printAll);
document.getElementById('searchInput')?.addEventListener('input', renderData);
