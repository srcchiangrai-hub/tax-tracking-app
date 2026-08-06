// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ ใส่ค่า Config ของระบบ Firebase ของคุณตรงนี้ (ใช้ค่าเดิมของคุณ)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const casesCollection = collection(db, "revenue_cases");

// Global Data Store
let rawCasesData = [];
let currentStaffFilter = "";

// ==========================================
// 2. REALTIME DATA LISTENER & INIT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // ดึงข้อมูล Realtime จาก Firestore
    const q = query(casesCollection, orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        rawCasesData = [];
        snapshot.forEach((doc) => {
            rawCasesData.push({ id: doc.id, ...doc.data() });
        });
        
        // อัปเดตส่วนต่างๆ ของแดชบอร์ด
        renderDashboardStats();
        renderStaffSummary();
        renderDashboardTable();
    });

    // ผูก Event Handler กับปุ่มปิด Modal
    window.closeCaseModal = closeCaseModal;
    window.filterByStaff = filterByStaff;
    window.openCaseModal = openCaseModal;
});

// ==========================================
// 3. STATS & SUMMARY CALCULATION
// ==========================================
function renderDashboardStats() {
    let totalAmount = 0;
    let collectedAmount = 0;
    let blackCount = 0;
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    rawCasesData.forEach(item => {
        totalAmount += Number(item.amount || 0);
        
        if (item.statusFlag === 'green') {
            collectedAmount += Number(item.amount || 0);
            greenCount++;
        } else if (item.statusFlag === 'black') {
            blackCount++;
        } else if (item.statusFlag === 'red') {
            redCount++;
        } else if (item.statusFlag === 'yellow') {
            yellowCount++;
        }
    });

    // อัปเดต Element บน DOM
    const totalElem = document.getElementById("stat-total-amount");
    const collectedElem = document.getElementById("stat-collected-amount");
    const blackElem = document.getElementById("stat-black-count");
    const redElem = document.getElementById("stat-red-count");
    const yellowElem = document.getElementById("stat-yellow-count");
    const greenElem = document.getElementById("stat-green-count");

    if (totalElem) totalElem.innerText = `฿${totalAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    if (collectedElem) collectedElem.innerText = `฿${collectedAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    if (blackElem) blackElem.innerText = `${blackCount} เคส`;
    if (redElem) redElem.innerText = `${redCount} เคส`;
    if (yellowElem) yellowElem.innerText = `${yellowCount} เคส`;
    if (greenElem) greenElem.innerText = `${greenCount} เคส`;
}

// ==========================================
// 4. STAFF SUMMARY GRID RENDERER
// ==========================================
function renderStaffSummary() {
    const container = document.getElementById("staff-summary-grid");
    if (!container) return;

    // สรุปข้อมูลแยกตามรายชื่อเจ้าหน้าที่
    const staffMap = {};

    rawCasesData.forEach(item => {
        const staffName = item.officerName || "ไม่ระบุเจ้าหน้าที่";
        if (!staffMap[staffName]) {
            staffMap[staffName] = { total: 0, black: 0, red: 0, yellow: 0, green: 0, amount: 0 };
        }
        staffMap[staffName].total += 1;
        staffMap[staffName].amount += Number(item.amount || 0);
        if (item.statusFlag === 'black') staffMap[staffName].black += 1;
        if (item.statusFlag === 'red') staffMap[staffName].red += 1;
        if (item.statusFlag === 'yellow') staffMap[staffName].yellow += 1;
        if (item.statusFlag === 'green') staffMap[staffName].green += 1;
    });

    if (Object.keys(staffMap).length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-xs text-slate-400 py-4">ยังไม่มีข้อมูลภาระงานเจ้าหน้าที่</p>`;
        return;
    }

    let html = "";
    for (const [name, data] of Object.entries(staffMap)) {
        const isSelected = currentStaffFilter === name;
        html += `
            <div onclick="filterByStaff('${name}')" 
                 class="p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                     isSelected 
                     ? 'border-pink-500 bg-pink-50/50 shadow-md ring-2 ring-pink-200' 
                     : 'border-slate-100 bg-slate-50/50 hover:border-pink-300 hover:bg-white'
                 }">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-slate-800 text-sm truncate">${name}</span>
                    <span class="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">${data.total} เคส</span>
                </div>
                <div class="text-xs text-slate-500 mb-3">
                    ทุนทรัพย์รวม: <span class="font-bold text-slate-700">฿${data.amount.toLocaleString()}</span>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                    <span class="px-1.5 py-0.5 rounded bg-slate-900 text-white font-medium" title="ด่วนมาก">${data.black}</span>
                    <span class="px-1.5 py-0.5 rounded bg-rose-500 text-white font-medium" title="ค้างชำระ">${data.red}</span>
                    <span class="px-1.5 py-0.5 rounded bg-amber-400 text-white font-medium" title="ติดตาม">${data.yellow}</span>
                    <span class="px-1.5 py-0.5 rounded bg-emerald-500 text-white font-medium" title="เสร็จสิ้น">${data.green}</span>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function filterByStaff(name) {
    currentStaffFilter = currentStaffFilter === name ? "" : name; // กดซ้ำเพื่อยกเลิก Filter
    renderStaffSummary();
    renderDashboardTable();
}

// ==========================================
// 5. DASHBOARD TABLE RENDERER
// ==========================================
window.renderDashboardTable = function() {
    const tbody = document.getElementById("dashboard-data-table");
    const searchInput = document.getElementById("search-input");
    if (!tbody) return;

    const queryText = searchInput ? searchInput.value.trim().toLowerCase() : "";

    // กรองข้อมูลตาม Search Query และ Staff Filter
    const filtered = rawCasesData.filter(item => {
        const matchesStaff = currentStaffFilter === "" || item.officerName === currentStaffFilter;
        const matchesSearch = 
            (item.taxpayerName && item.taxpayerName.toLowerCase().includes(queryText)) ||
            (item.officerName && item.officerName.toLowerCase().includes(queryText)) ||
            (item.taxId && item.taxId.toLowerCase().includes(queryText)) ||
            (item.taxType && item.taxType.toLowerCase().includes(queryText));
        
        return matchesStaff && matchesSearch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-slate-400 text-xs">
                    ไม่พบข้อมูลที่ตรงกับการค้นหา
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        // แปลง Flag เป็น Badge สี
        let flagBadge = "";
        switch (item.statusFlag) {
            case 'black': flagBadge = '<span class="px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg font-medium">⚫ เร่งด่วน</span>'; break;
            case 'red': flagBadge = '<span class="px-2.5 py-1 bg-rose-100 text-rose-600 text-xs rounded-lg font-medium">🔴 ค้างชำระ</span>'; break;
            case 'yellow': flagBadge = '<span class="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg font-medium">🟡 ติดตาม</span>'; break;
            case 'green': flagBadge = '<span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-medium">🟢 เสร็จสิ้น</span>'; break;
            default: flagBadge = '<span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">⚪ ทั่วไป</span>';
        }

        return `
            <tr class="hover:bg-pink-50/30 transition-colors">
                <td class="p-3">${flagBadge}</td>
                <td class="p-3 font-semibold text-slate-800">${item.taxpayerName || '-'}</td>
                <td class="p-3 text-slate-600">${item.taxType || '-'} / ${item.taxYear || '-'}</td>
                <td class="p-3 font-bold text-slate-700">฿${Number(item.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                <td class="p-3 text-slate-500 text-xs">${item.processStep || '-'}</td>
                <td class="p-3 text-slate-600 text-xs">${item.officerName || '-'}</td>
                <td class="p-3 text-center">
                    <button onclick="openCaseModal('${item.id}')" class="px-3 py-1 bg-pink-100 text-pink-600 hover:bg-pink-500 hover:text-white transition-colors rounded-xl text-xs font-semibold">
                        <i class="fa-solid fa-eye"></i> ดูข้อมูล
                    </button>
                </td>
            </tr>
        `;
    }).join("");
};

// ==========================================
// 6. MODAL DETAIL CONTROLLER
// ==========================================
function openCaseModal(docId) {
    const item = rawCasesData.find(c => c.id === docId);
    if (!item) return;

    const modal = document.getElementById("case-detail-modal");
    const container = document.getElementById("modal-content");
    if (!modal || !container) return;

    let flagBadge = "";
    switch (item.statusFlag) {
        case 'black': flagBadge = '<span class="px-3 py-1 bg-slate-900 text-white text-xs rounded-lg">⚫ เร่งด่วนวิกฤต</span>'; break;
        case 'red': flagBadge = '<span class="px-3 py-1 bg-rose-100 text-rose-600 text-xs rounded-lg">🔴 ค้างชำระนาน</span>'; break;
        case 'yellow': flagBadge = '<span class="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg">🟡 อยู่ระหว่างติดตาม</span>'; break;
        case 'green': flagBadge = '<span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg">🟢 ชำระครบถ้วนแล้ว</span>'; break;
    }

    container.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            ${flagBadge}
            <span class="text-xs text-slate-400">เลขภาษี / ID: ${item.taxId || item.id}</span>
        </div>
        <h3 class="font-cute text-2xl font-bold text-slate-800 mb-4">${item.taxpayerName || 'ไม่ระบุชื่อ'}</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pink-50/50 p-4 rounded-2xl mb-4 border border-pink-100 text-xs">
            <div>
                <p class="text-slate-400">ประเภทภาษี</p>
                <p class="font-semibold text-slate-700 text-sm mt-0.5">${item.taxType || '-'}</p>
            </div>
            <div>
                <p class="text-slate-400">ปีภาษี</p>
                <p class="font-semibold text-slate-700 text-sm mt-0.5">${item.taxYear || '-'}</p>
            </div>
            <div>
                <p class="text-slate-400">ยอดประเมิน / ค้างชำระ</p>
                <p class="font-bold text-pink-600 text-base mt-0.5">฿${Number(item.amount || 0).toLocaleString('th-TH', {minimumFractionDigits: 2})}</p>
            </div>
            <div>
                <p class="text-slate-400">ขั้นตอนการดำเนินงาน</p>
                <p class="font-semibold text-slate-700 text-sm mt-0.5">${item.processStep || '-'}</p>
            </div>
        </div>

        <div class="space-y-3 text-xs mb-6">
            <div class="border-b pb-2">
                <span class="text-slate-400 block mb-1">ที่อยู่ / สถานที่ประกอบการ:</span>
                <span class="text-slate-700 font-medium">${item.address || 'ไม่ระบุ'}</span>
            </div>
            <div class="border-b pb-2">
                <span class="text-slate-400 block mb-1">เบอร์โทรศัพท์ติดต่อ:</span>
                <span class="text-slate-700 font-medium">${item.phone || 'ไม่ระบุ'}</span>
            </div>
            <div class="border-b pb-2">
                <span class="text-slate-400 block mb-1">บันทึกหมายเหตุการลงพื้นที่ / ติดตาม:</span>
                <p class="text-slate-700 bg-slate-50 p-3 rounded-xl mt-1 leading-relaxed">${item.notes || 'ไม่มีบันทึกเพิ่มเติม'}</p>
            </div>
            <div>
                <span class="text-slate-400 block mb-1">เจ้าหน้าที่ผู้รับผิดชอบเคส:</span>
                <span class="text-slate-800 font-semibold">${item.officerName || 'ไม่ระบุ'}</span>
            </div>
        </div>

        <div class="flex justify-end">
            <button onclick="closeCaseModal()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors">
                ปิดหน้าต่าง
            </button>
        </div>
    `;

    modal.classList.remove("hidden");
}

function closeCaseModal() {
    const modal = document.getElementById("case-detail-modal");
    if (modal) modal.classList.add("hidden");
}
