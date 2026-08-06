import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 1. ใส่ค่า Firebase Config ของคุณตรงนี้
const firebaseConfig = {
    apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// 🔴 2. URL Web App สำหรับอัปโหลดรูปเข้า Google Drive
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzJVT-FV_TxiRBXW4CnJIcPrOjoclfJDQZSUJDmyCUOuTypaD3ogrYGorNnVMPfHtvBkQ/exec";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let rawDataList = [];

// ฟังก์ชันแปลงไฟล์เป็น Base64 สำหรับส่งไป Google Apps Script
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// --- 1. การทำงานในหน้า admin.html (ฟอร์มบันทึกข้อมูล) ---
const taxForm = document.getElementById('taxForm');
if (taxForm) {
    taxForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = document.getElementById('btnSubmit');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = "⏳ กำลังดำเนินการ...";

        try {
            const name = document.getElementById('name').value.trim();
            const taxType = document.getElementById('taxType').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const imageFile = document.getElementById('imageFile').files[0];

            let imageUrl = "";

            // หากเลือกไฟล์รูปภาพ ให้ส่งไฟล์ไปยัง Google Drive
            if (imageFile) {
                btnSubmit.innerHTML = "⏳ กำลังอัปโหลดรูปไปยัง Google Drive...";
                const base64Data = await fileToBase64(imageFile);
                
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        fileName: `${Date.now()}_${imageFile.name}`,
                        mimeType: imageFile.type,
                        fileData: base64Data
                    })
                });

                const result = await response.json();
                if (result.status === "success") {
                    imageUrl = result.url;
                } else {
                    throw new Error("Upload Drive Error: " + result.message);
                }
            }

            btnSubmit.innerHTML = "⏳ กำลังบันทึกข้อมูลภาษี...";

            // บันทึกรายละเอียดลงใน Firebase Firestore
            await addDoc(collection(db, "tax_records"), {
                name: name,
                taxType: taxType,
                amount: amount,
                imageUrl: imageUrl, // เก็บบันทึก URL รูปภาพบน Google Drive
                createdAt: serverTimestamp()
            });

            alert("✅ บันทึกข้อมูลและอัปโหลดสลิปเข้า Google Drive เรียบร้อยแล้ว!");
            taxForm.reset();

        } catch (error) {
            console.error("Error: ", error);
            alert("❌ เกิดข้อผิดพลาด: " + error.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "💾 บันทึกข้อมูลเข้าระบบ";
        }
    });
}

// --- 2. ฟังก์ชันแสดงผล ค้นหา และจัดเรียง (ทั้ง admin.html และ index.html) ---
const dataTable = document.getElementById('dataTable');
const dashboardTable = document.getElementById('dashboardTable');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// ดึงข้อมูลแบบ Realtime จาก Firestore
if (dataTable || dashboardTable) {
    const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        rawDataList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderData();
    });
}

// ฟังก์ชันประมวลผลและวาดตาราง
function renderData() {
    if (!rawDataList) return;

    let filtered = [...rawDataList];
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'desc';

    // 1. ระบบค้นหาตามชื่อ หรือประเภทภาษี
    if (searchText) {
        filtered = filtered.filter(item => 
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.taxType && item.taxType.toLowerCase().includes(searchText))
        );
    }

    // 2. ระบบจัดเรียงข้อมูล
    filtered.sort((a, b) => {
        if (sortBy === 'asc') {
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        } else if (sortBy === 'name_asc') {
            return (a.name || '').localeCompare(b.name || '', 'th');
        } else if (sortBy === 'name_desc') {
            return (b.name || '').localeCompare(a.name || '', 'th');
        } else {
            // desc (ใหม่ล่าสุด)
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
    });

    // 3. แสดงผลหน้า admin.html
    if (dataTable) {
        if (filtered.length === 0) {
            dataTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">ไม่พบข้อมูล</td></tr>`;
        } else {
            dataTable.innerHTML = filtered.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.taxType}</td>
                    <td class="text-end fw-bold">${item.amount ? item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                    <td class="text-center">
                        ${item.imageUrl 
                            ? `<a href="${item.imageUrl}" target="_blank" class="btn btn-sm btn-outline-info">🖼️ ดูสลิป (Drive)</a>` 
                            : '<span class="text-muted">-</span>'}
                    </td>
                </tr>
            `).join('');
        }
    }

    // 4. แสดงผลหน้า index.html (Dashboard)
    if (dashboardTable) {
        let totalAmount = 0;

        if (filtered.length === 0) {
            dashboardTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">ไม่พบข้อมูล</td></tr>`;
        } else {
            dashboardTable.innerHTML = filtered.map(item => {
                totalAmount += (item.amount || 0);
                
                let dateStr = "-";
                if (item.createdAt) {
                    const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date();
                    dateStr = date.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
                }

                return `
                    <tr>
                        <td>${dateStr}</td>
                        <td><strong>${item.name}</strong></td>
                        <td><span class="badge bg-secondary">${item.taxType}</span></td>
                        <td class="text-end fw-bold text-success">${item.amount ? item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                        <td class="text-center">
                            ${item.imageUrl 
                                ? `<a href="${item.imageUrl}" target="_blank" class="btn btn-sm btn-primary">เปิดดู Drive</a>` 
                                : '<span class="text-muted">ไม่มี</span>'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // อัปเดตยอดรวมและการ์ดสรุปผล
        const totalAmountEl = document.getElementById('totalAmount');
        const totalCountEl = document.getElementById('totalCount');
        
        if (totalAmountEl) totalAmountEl.innerText = `${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
        if (totalCountEl) totalCountEl.innerText = `${filtered.length} รายการ`;
    }
}

// ลงทะเบียนการค้นหาและจัดเรียงเรียลไทม์
if (searchInput) searchInput.addEventListener('input', renderData);
if (sortSelect) sortSelect.addEventListener('change', renderData);
