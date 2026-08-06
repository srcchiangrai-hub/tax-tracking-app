import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzJVT-FV_TxiRBXW4CnJIcPrOjoclfJDQZSUJDmyCUOuTypaD3ogrYGorNnVMPfHtvBkQ/exec";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let rawDataList = [];

// --- 1. ระบบตรวจสอบการ Login ---
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (user) {
        if (currentPage === "login.html" || currentPage === "") {
            window.location.href = "admin.html";
        }
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.innerText = `👤 ${user.email}`;
    } else {
        if (currentPage !== "login.html") {
            window.location.href = "login.html";
        }
    }
});

// ฟังก์ชัน Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btnLogin = document.getElementById('btnLogin');

        try {
            btnLogin.disabled = true;
            btnLogin.innerText = "⏳ กำลังเข้าสู่ระบบ...";
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "admin.html";
        } catch (error) {
            alert("❌ เข้าสู่ระบบไม่สำเร็จ: " + error.message);
            btnLogin.disabled = false;
            btnLogin.innerText = "🚀 เข้าสู่ระบบ";
        }
    });
}

// ฟังก์ชัน Logout
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => signOut(auth));
}

// --- 2. ฟังก์ชัน ดึงพิกัด GPS ---
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

// แปลงไฟล์ภาพเป็น Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// --- 3. บันทึกฟอร์มลง Firebase & Google Drive ---
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
                btnSubmit.innerHTML = "⏳ อัปโหลดภาพเข้า Google Drive...";
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

            alert("✅ บันทึกข้อมูลและส่งรูปเข้า Google Drive เรียบร้อย!");
            taxForm.reset();
        } catch (err) {
            alert("❌ เกิดข้อผิดพลาด: " + err.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "💾 บันทึกข้อมูลเข้าฐานข้อมูล";
        }
    });
}

// --- 4. ดึงข้อมูล Realtime & แสดงผล ---
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

    // ผูกปุ่มพิมพ์รายรายการ
    document.querySelectorAll('.print-single-btn').forEach(btn => {
        btn.addEventListener('click', (e) => printSingle(e.target.dataset.id));
    });
}

// --- 5. ระบบ พิมพ์หนังสือแบบราชการ ---
function printSingle(id) {
    const item = rawDataList.find(i => i.id === id);
    if (!item) return;

    const area = document.getElementById('printableArea');
    area.innerHTML = `
        <div style="font-family: 'Sarabun', sans-serif; padding: 20px; line-height: 1.6;">
            <h3 style="text-align: center; font-weight: bold;">รายงานผลการออกติดตามภาษีท้องถิ่น</h3>
            <hr>
            <p><strong>ประเภทภาษี:</strong> ${item.taxType} (ปี ${item.taxYear})</p>
            <p><strong>ชื่อผู้เสียภาษี:</strong> ${item.name} (เลขประจำตัว: ${item.taxId})</p>
            <p><strong>ที่อยู่ติดตาม:</strong> บ้านเลขที่ ${item.houseNo} หมู่ ${item.moo || '-'} ต.${item.subDistrict} อ.${item.district} จ.${item.province}</p>
            <p><strong>เอกสารนำส่ง:</strong> ${item.docType}</p>
            <p><strong>ยอดภาษีค้างชำระ:</strong> ${item.amount.toLocaleString('th-TH', {minimumFractionDigits: 2})} บาท</p>
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

// ระบบพิมพ์รวมทั้งหมด
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
                        <td style="text-align:right;">${i.amount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
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
