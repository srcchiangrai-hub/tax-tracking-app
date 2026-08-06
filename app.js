/**
 * RevenueCute Tracker - Application Core Logic & Firebase Integration
 * รองรับการจัดการข้อมูลผู้เสียภาษี คำนวณเบี้ยปรับ/เงินเพิ่ม และประมวลผลแดชบอร์ด
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. ตั้งค่าการเชื่อมต่อ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
    authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
    projectId: "tax-tracking-app-25fb7",
    storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
    messagingSenderId: "122118718226",
    appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const TAX_COLLECTION = "tax_records";

// Global State
window.recordsData = [];

// -------------------------------------------------------------
// 2. Event Listeners & Initial Load
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetchRecords();
});

/**
 * ดึงข้อมูลผู้เสียภาษีทั้งหมดจาก Firestore
 */
export async function fetchRecords() {
    try {
        const q = query(collection(db, TAX_COLLECTION));
        const querySnapshot = await getDocs(q);
        
        window.recordsData = [];
        querySnapshot.forEach((docSnap) => {
            window.recordsData.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // ตรวจสอบว่าอยู่หน้าไหน แล้วเรียกใช้ Render Function ของหน้านั้น
        if (document.getElementById('admin-data-table')) {
            renderAdminTable();
        }
        if (document.getElementById('stat-total-amount')) {
            renderDashboardStats();
        }

    </div>} catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Firebase:", error);
    }
}

// -------------------------------------------------------------
// 3. Form Handling (บันทึก / แก้ไข / คำนวณภาษี)
// -------------------------------------------------------------

/**
 * คำนวณยอดรวมค้างชำระ (ยอดหลัก + เบี้ยปรับ + เงินเพิ่ม)
 */
window.calculateTotalTax = function() {
    const main = parseFloat(document.getElementById('mainTaxAmount')?.value) || 0;
    const penalty = parseFloat(document.getElementById('penaltyAmount')?.value) || 0;
    const surcharge = parseFloat(document.getElementById('surchargeAmount')?.value) || 0;
    
    const totalInput = document.getElementById('totalDueAmount');
    if (totalInput) {
        totalInput.value = (main + penalty + surcharge).toFixed(2);
    }
};

/**
 * บันทึกหรืออัปเดตข้อมูลผู้เสียภาษีลง Firestore
 */
window.handleFormSubmit = async function(e) {
    e.preventDefault();
    const docId = document.getElementById('doc-id').value;

    const payload = {
        taxpayerName: document.getElementById('taxpayerName').value.trim(),
        taxId: document.getElementById('taxId').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        taxType: document.getElementById('taxType').value,
        taxYear: document.getElementById('taxYear').value.trim(),
        propertyCode: document.getElementById('propertyCode').value.trim(),
        zone: document.getElementById('zone').value.trim(),
        mainTaxAmount: parseFloat(document.getElementById('mainTaxAmount').value) || 0,
        penaltyAmount: parseFloat(document.getElementById('penaltyAmount').value) || 0,
        surchargeAmount: parseFloat(document.getElementById('surchargeAmount').value) || 0,
        totalDueAmount: parseFloat(document.getElementById('totalDueAmount').value) || 0,
        trackingStep: document.getElementById('trackingStep').value,
        priorityFlag: document.getElementById('priorityFlag').value,
        assignedStaff: document.getElementById('assignedStaff').value.trim(),
        fieldNotes: document.getElementById('fieldNotes').value.trim(),
        paymentDate: document.getElementById('paymentDate').value,
        receiptNo: document.getElementById('receiptNo').value.trim(),
        paymentChannel: document.getElementById('paymentChannel').value,
        updatedAt: new Date().toISOString()
    };

    try {
        if (docId) {
            // อัปเดตรายการเดิม
            await updateDoc(doc(db, TAX_COLLECTION, docId), payload);
            alert("🐱 อัปเดตข้อมูลสำเร็จเรียบร้อยแล้ว!");
        } else {
            // เพิ่มรายการใหม่
            payload.createdAt = new Date().toISOString();
            await addDoc(collection(db, TAX_COLLECTION), payload);
            alert("🎉 บันทึกผู้เสียภาษีรายใหม่สำเร็จ!");
        }
        
        resetForm();
        fetchRecords();
    } catch (err) {
        console.error("Error saving document:", err);
        alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    }
};

/**
 * ล้างข้อมูลในฟอร์ม
 */
window.resetForm = function() {
    const form = document.getElementById('tax-form');
    if (form) form.reset();
    const docId = document.getElementById('doc-id');
    if (docId) docId.value = '';
};

// -------------------------------------------------------------
// 4. Admin Management (การดึงมาแก้ไข / ลบ / ค้นหา / สเปกพิมพ์ A4)
// -------------------------------------------------------------

/**
 * ดึงข้อมูลมาใส่ฟอร์มเพื่อแก้ไข
 */
window.editRecord = function(id) {
    const item = window.recordsData.find(r => r.id === id);
    if (!item) return;

    document.getElementById('doc-id').value = item.id;
    document.getElementById('taxpayerName').value = item.taxpayerName || '';
    document.getElementById('taxId').value = item.taxId || '';
    document.getElementById('phone').value = item.phone || '';
    document.getElementById('address').value = item.address || '';
    document.getElementById('taxType').value = item.taxType || 'ภาษีที่ดินและสิ่งปลูกสร้าง';
    document.getElementById('taxYear').value = item.taxYear || '';
    document.getElementById('propertyCode').value = item.propertyCode || '';
    document.getElementById('zone').value = item.zone || '';
    document.getElementById('mainTaxAmount').value = item.mainTaxAmount || 0;
    document.getElementById('penaltyAmount').value = item.penaltyAmount || 0;
    document.getElementById('surchargeAmount').value = item.surchargeAmount || 0;
    document.getElementById('totalDueAmount').value = item.totalDueAmount || 0;
    document.getElementById('trackingStep').value = item.trackingStep || '';
    document.getElementById('priorityFlag').value = item.priorityFlag || 'RED';
    document.getElementById('assignedStaff').value = item.assignedStaff || '';
    document.getElementById('fieldNotes').value = item.fieldNotes || '';
    document.getElementById('paymentDate').value = item.paymentDate || '';
    document.getElementById('receiptNo').value = item.receiptNo || '';
    document.getElementById('paymentChannel').value = item.paymentChannel || 'เงินสด';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * ลบข้อมูลรายเคสออกจาก Firestore
 */
window.deleteRecord = async function(id) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ออกจากระบบ?")) {
        try {
            await deleteDoc(doc(db, TAX_COLLECTION, id));
            fetchRecords();
        } catch (err) {
            alert("ไม่สามารถลบข้อมูลได้: " + err.message);
        }
    }
};

/**
 * วาดตารางข้อมูลในหน้า admin.html
 */
window.renderAdminTable = function() {
    const searchInput = document.getElementById('search-input');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const tbody = document.getElementById('admin-data-table');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = window.recordsData.filter(r => 
        (r.taxpayerName || '').toLowerCase().includes(search) ||
        (r.taxId || '').includes(search) ||
        (r.taxYear || '').includes(search) ||
        (r.propertyCode || '').toLowerCase().includes(search)
    );

    filtered.forEach(r => {
        const badgeColor = getFlagBadge(r.priorityFlag);
        tbody.innerHTML += `
            <tr class="hover:bg-pink-50/20 text-slate-700">
                <td class="p-3">${badgeColor}</td>
                <td class="p-3 font-semibold">${r.taxpayerName}<br><span class="text-xs text-slate-400">ID: ${r.taxId || '-'}</span></td>
                <td class="p-3">${r.taxType}<br><span class="text-xs font-bold text-pink-500">ปี ${r.taxYear || '-'}</span></td>
                <td class="p-3 font-bold text-rose-500">฿${(r.totalDueAmount || 0).toLocaleString('th-TH', {minimumFractionDigits:2})}</td>
                <td class="p-3 text-xs font-medium">${r.trackingStep || '-'}</td>
                <td class="p-3 text-xs">${r.assignedStaff || '-'}</td>
                <td class="p-3 text-center space-x-1">
                    <button onclick="editRecord('${r.id}')" title="แก้ไข" class="text-blue-500 hover:text-blue-700 p-1.5"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="printSingleOfficialDoc('${r.id}')" title="พิมพ์ใบบันทึก A4" class="text-slate-600 hover:text-slate-900 p-1.5"><i class="fa-solid fa-print"></i></button>
                    <button onclick="deleteRecord('${r.id}')" title="ลบ" class="text-rose-400 hover:text-rose-600 p-1.5"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
};

/**
 * สั่งพิมพ์ใบบันทึกราชการ A4 แยกรายบุคคล (TH Sarabun 16pt)
 */
window.printSingleOfficialDoc = function(id) {
    const person = window.recordsData.find(r => r.id === id);
    if (!person) return;

    const printArea = document.getElementById('official-print-area');
    if (!printArea) return;

    printArea.innerHTML = `
        <div class="official-doc bg-white max-w-[210mm] mx-auto leading-relaxed">
            <!-- ตราครุฑมาตรฐานราชการ -->
            <div class="text-center mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Garuda_Emblem_of_Thailand.svg" alt="ตราครุฑ" class="h-20 mx-auto mb-2">
                <h2 class="font-bold text-xl">ใบบันทึกการติดตามและเร่งรัดจัดเก็บรายได้</h2>
                <p class="font-semibold text-base">ฝ่ายจัดเก็บรายได้ กองคลัง องค์กรปกครองส่วนท้องถิ่น</p>
            </div>

            <div class="mt-6 space-y-3">
                <div class="flex justify-between">
                    <div><strong>ชื่อผู้เสียภาษี / นิติบุคคล:</strong> ${person.taxpayerName}</div>
                    <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> ${person.taxId || '-'}</div>
                </div>
                <div><strong>ที่อยู่ส่งเอกสาร:</strong> ${person.address || '-'} <strong>โทรศัพท์:</strong> ${person.phone || '-'}</div>
                
                <div class="border-t border-b border-black py-2 my-3 grid grid-cols-3 gap-2 font-semibold">
                    <div>ประเภทภาษี: ${person.taxType}</div>
                    <div>ประจำปีประเมิน: ${person.taxYear}</div>
                    <div>รหัสแปลง/ป้าย: ${person.propertyCode || '-'}</div>
                </div>

                <div class="p-3 border border-black my-4">
                    <h3 class="font-bold underline mb-1">สรุปรายการประเมินและยอดค้างชำระ</h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div>• ภาษีประเมินหลัก: ${(person.mainTaxAmount||0).toLocaleString('th-TH', {minimumFractionDigits:2})} บาท</div>
                        <div>• เบี้ยปรับ: ${(person.penaltyAmount||0).toLocaleString('th-TH', {minimumFractionDigits:2})} บาท</div>
                        <div>• เงินเพิ่ม (1%/เดือน): ${(person.surchargeAmount||0).toLocaleString('th-TH', {minimumFractionDigits:2})} บาท</div>
                        <div class="font-bold">• ยอดเงินรวมทั้งสิ้น: ${(person.totalDueAmount||0).toLocaleString('th-TH', {minimumFractionDigits:2})} บาท</div>
                    </div>
                </div>

                <div>
                    <strong>ขั้นตอนการดำเนินงานตามกฎหมายปัจจุบัน:</strong> ${person.trackingStep || '-'}
                </div>

                <div class="mt-4">
                    <strong>บันทึกการลงพื้นที่และอุปสรรคการติดตาม:</strong>
                    <div class="p-3 border border-black min-h-[120px] mt-1 bg-white">
                        ${person.fieldNotes || 'ไม่มีบันทึกเพิ่มเติม'}
                    </div>
                </div>
            </div>

            <!-- ลายเซ็นงานสารบรรณ -->
            <div class="mt-20 grid grid-cols-2 gap-8 text-center">
                <div class="space-y-8">
                    <p>ลงชื่อ..........................................................<br>(${person.assignedStaff || '..........................................................'})<br>ตำแหน่ง เจ้าหน้าที่ผู้ติดตาม/ผู้ลงบันทึก</p>
                    <p>วันที่......../......................../............</p>
                </div>
                <div class="space-y-8">
                    <p>ลงชื่อ..........................................................<br>(..........................................................)<br>ตำแหน่ง ผู้อำนวยการกองคลัง / หัวหน้าฝ่ายจัดเก็บรายได้</p>
                    <p>วันที่......../......................../............</p>
                </div>
            </div>
        </div>
    `;

    window.print();
};

// -------------------------------------------------------------
// 5. Dashboard Calculations (คำนวณและประมวลผลสำหรับ index.html)
// -------------------------------------------------------------

/**
 * คำนวณสถิติและอัปเดตหน้า Dashboard
 */
function renderDashboardStats() {
    let totalTarget = 0;
    let totalCollected = 0;
    let blackCount = 0;
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    window.recordsData.forEach(r => {
        const total = r.totalDueAmount || 0;
        totalTarget += total;

        if (r.priorityFlag === 'GREEN' || r.paymentDate) {
            totalCollected += total;
            greenCount++;
        } else if (r.priorityFlag === 'BLACK') {
            blackCount++;
        } else if (r.priorityFlag === 'RED') {
            redCount++;
        } else if (r.priorityFlag === 'YELLOW') {
            yellowCount++;
        }
    });

    const statTotal = document.getElementById('stat-total-amount');
    const statCollected = document.getElementById('stat-collected-amount');
    const statBlack = document.getElementById('stat-black-count');
    const statRed = document.getElementById('stat-red-count');
    const statYellow = document.getElementById('stat-yellow-count');
    const statGreen = document.getElementById('stat-green-count');

    if (statTotal) statTotal.innerText = `฿${totalTarget.toLocaleString('th-TH', {minimumFractionDigits:2})}`;
    if (statCollected) statCollected.innerText = `฿${totalCollected.toLocaleString('th-TH', {minimumFractionDigits:2})}`;
    if (statBlack) statBlack.innerText = blackCount;
    if (statRed) statRed.innerText = redCount;
    if (statYellow) statYellow.innerText = yellowCount;
    if (statGreen) statGreen.innerText = greenCount;
}

// Helper: Badge สีสำหรับระดับความด่วน
function getFlagBadge(flag) {
    switch(flag) {
        case 'BLACK': return '<span class="px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg">⚫ เร่งด่วนมาก</span>';
        case 'RED': return '<span class="px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg">🔴 ค้างชำระ</span>';
        case 'YELLOW': return '<span class="px-2.5 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-lg">🟡 ติดตาม</span>';
        case 'GREEN': return '<span class="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">🟢 ชำระแล้ว</span>';
        default: return '-';
    }
}
