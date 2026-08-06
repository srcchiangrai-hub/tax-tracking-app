import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 1. วางค่า firebaseConfig ของคุณลงในนี้ได้เลยครับ
const firebaseConfig = {
    apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// 🔴 2. URL Google Apps Script Web App ของคุณ
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzJVT-FV_TxiRBXW4CnJIcPrOjoclfJDQZSUJDmyCUOuTypaD3ogrYGorNnVMPfHtvBkQ/exec";

// เริ่มต้นใช้งาน Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let rawDataList = [];

// ฟังก์ชันสำหรับแปลงไฟล์ภาพเป็น Base64 ส่งไป Google Drive
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// แสดงพรีวิวภาพเมื่อเลือกไฟล์ในหน้า admin.html
const imageFile = document.getElementById('imageFile');
const preview = document.getElementById('preview');
if (imageFile && preview) {
    imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
}

// --- 1. การทำงานในหน้า admin.html (ฟอร์มบันทึกข้อมูล) ---
const taxForm = document.getElementById('taxForm');
if (taxForm) {
    taxForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i>กำลังดำเนินการ...`;

        try {
            const name = document.getElementById('name').value.trim();
            const taxType = document.getElementById('taxType').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const file = imageFile.files[0];

            let imageUrl = "";

            // หากมีการแนบรูปสลิป ให้อัปโหลดเข้า Google Drive ผ่าน Apps Script
            if (file) {
                submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up fa-bounce me-2"></i>กำลังอัปโหลดรูปไปยัง Google Drive...`;
                const base64Data = await fileToBase64(file);
                
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        fileName: `${Date.now()}_${file.name}`,
                        mimeType: file.type,
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

            submitBtn.innerHTML = `<i class="fa-solid fa-database fa-spin me-2"></i>กำลังบันทึกข้อมูลภาษี...`;

            // บันทึกรายละเอียดทั้งหมดลงใน Firebase Firestore
            await addDoc(collection(db, "tax_records"), {
                name: name,
                taxType: taxType,
                amount: amount,
                imageUrl: imageUrl, // เก็บบันทึก URL รูปจาก Google Drive
                createdAt: serverTimestamp()
            });

            alert("✅ บันทึกข้อมูลและอัปโหลดสลิปเข้า Google Drive เรียบร้อยแล้ว!");
            taxForm.reset();
            if (preview) preview.style.display = 'none';

        } catch (error) {
            console.error("Error: ", error);
            alert("❌ เกิดข้อผิดพลาด: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up me-2"></i>บันทึกข้อมูล`;
        }
    });
}

// --- 2. ฟังก์ชันแสดงผล ค้นหา จัดเรียง และ Modal ดูรูปภาพ ---
const dataTable = document.getElementById('dataTable');
const dashboardTable = document.getElementById('dashboardTable');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// ดึงข้อมูล Realtime จาก Firebase Firestore
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

function renderData() {
    if (!rawDataList) return;

    let filtered = [...rawDataList];
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'desc';

    // ระบบค้นหาตามชื่อ หรือประเภทภาษี
    if (searchText) {
        filtered = filtered.filter(item => 
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.taxType && item.taxType.toLowerCase().includes(searchText))
        );
    }

    // ระบบจัดเรียงข้อมูล
    filtered.sort((a, b) => {
        if (sortBy === 'asc') {
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        } else if (sortBy === 'name_asc') {
            return (a.name || '').localeCompare(b.name || '', 'th');
        } else if (sortBy === 'name_desc') {
            return (b.name || '').localeCompare(a.name || '', 'th');
        } else {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
    });

    // อัปเดตจำนวนรายการ
    const recordCountEl = document.getElementById('recordCount');
    if (recordCountEl) recordCountEl.innerText = `${filtered.length} รายการ`;

    // 1. แสดงผลในหน้า admin.html
    if (dataTable) {
        if (filtered.length === 0) {
            dataTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">ไม่พบข้อมูลรายการภาษี</td></tr>`;
        } else {
            dataTable.innerHTML = filtered.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="badge bg-light text-dark border">${item.taxType}</span></td>
                    <td class="text-end fw-bold text-primary">${item.amount ? item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                    <td class="text-center">
                        ${item.imageUrl 
                            ? `<button class="btn btn-sm btn-outline-info view-img-btn" data-url="${item.imageUrl}">
                                  <i class="fa-regular fa-image me-1"></i>ดูสลิป
                               </button>` 
                            : '<span class="text-muted fs-7">ไม่มีสลิป</span>'}
                    </td>
                </tr>
            `).join('');
        }
    }

    // 2. แสดงผลในหน้า index.html (Dashboard)
    if (dashboardTable) {
        let totalAmount = 0;

        if (filtered.length === 0) {
            dashboardTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">ไม่พบข้อมูลรายการภาษี</td></tr>`;
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
                        <td class="text-muted"><small><i class="fa-regular fa-clock me-1"></i>${dateStr}</small></td>
                        <td><strong>${item.name}</strong></td>
                        <td><span class="badge bg-secondary">${item.taxType}</span></td>
                        <td class="text-end fw-bold text-success">${item.amount ? item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                        <td class="text-center">
                            ${item.imageUrl 
                                ? `<button class="btn btn-sm btn-primary view-img-btn" data-url="${item.imageUrl}">
                                      <i class="fa-regular fa-image me-1"></i>เปิดดูสลิป
                                   </button>` 
                                : '<span class="text-muted fs-7">ไม่มีสลิป</span>'}
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // อัปเดตการ์ดตัวเลขสรุปผล
        const totalAmountEl = document.getElementById('totalAmount');
        const totalCountEl = document.getElementById('totalCount');
        
        if (totalAmountEl) totalAmountEl.innerText = `${totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
        if (totalCountEl) totalCountEl.innerText = `${filtered.length} รายการ`;
    }

    // ผูกเหตุการณ์คลิกเปิดดูรูปภาพใน Modal
    document.querySelectorAll('.view-img-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.currentTarget.getAttribute('data-url');
            const modalImage = document.getElementById('modalImage');
            const modalDriveLink = document.getElementById('modalDriveLink');
            
            if (modalImage && modalDriveLink) {
                modalImage.src = url;
                modalDriveLink.href = url;
                const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
                myModal.show();
            }
        });
    });
}

// ลงทะเบียน Event สำหรับ ค้นหา และ จัดเรียง
if (searchInput) searchInput.addEventListener('input', renderData);
if (sortSelect) sortSelect.addEventListener('change', renderData);
