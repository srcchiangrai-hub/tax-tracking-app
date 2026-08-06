// ==========================================
// 1. MOCK DATA & INITIAL STATE
// ==========================================
let revenueData = JSON.parse(localStorage.getItem('revenue_data')) || [
    {
        id: 'TAX-69001',
        taxId: '1-5099-00123-45-1',
        name: 'นายสมชาย ใจดี',
        taxType: 'ภาษีที่ดินและสิ่งปลูกสร้าง',
        taxYear: '2026',
        amount: 4500,
        status: '🔴 ค้างชำระ',
        step: 'ส่งหนังสือเตือน ครั้งที่ 1',
        officer: 'นางสาวนภา มีสุข',
        dueDate: '2026-08-01',
        address: '123/4 หมู่ 2 ต.ในเมือง อ.เมือง จ.เชียงราย'
    },
    {
        id: 'TAX-69002',
        taxId: '3-5001-00888-11-0',
        name: 'ห้างหุ้นส่วนจำกัด สยามการค้า',
        taxType: 'ภาษีป้าย',
        taxYear: '2026',
        amount: 1800,
        status: '🟡 ติดตาม',
        step: 'ลงพื้นที่ตรวจป้าย',
        officer: 'นายวิชัย รักษ์ดี',
        dueDate: '2026-08-15',
        address: '45/1 ถนนพาณิชย์ ต.เวียง อ.เมือง จ.เชียงราย'
    },
    {
        id: 'TAX-69003',
        taxId: '1-5099-00999-00-2',
        name: 'นางสาววิภาดาว มณีวรรณ',
        taxType: 'ภาษีที่ดินและสิ่งปลูกสร้าง',
        taxYear: '2026',
        amount: 12500,
        status: '🟢 เสร็จสิ้น',
        step: 'ชำระเงินเรียบร้อย',
        officer: 'นางสาวนภา มีสุข',
        dueDate: '2026-07-20',
        address: '88/9 หมู่ 5 ต.รอบเวียง อ.เมือง จ.เชียงราย'
    }
];

let selectedOfficerFilter = null;
let currentPeriod = 'month'; // 'month', 'quarter', 'year'

// Save data to LocalStorage
function saveData() {
    localStorage.setItem('revenue_data', JSON.stringify(revenueData));
}

// ==========================================
// 2. DOM LOAD & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    updateMainStats();
    updateTaxTypeStats();
    renderStaffSummary();
    renderDashboardTable();
}

// ==========================================
// 3. STATS CALCULATION & REAL-TIME FILTERING
// ==========================================

// สถิติสถานะรวม (🔴 ค้างชำระ / 🟡 ติดตาม / 🟢 เสร็จสิ้น)
function updateMainStats() {
    const redCount = revenueData.filter(d => d.status.includes('🔴') || d.status.includes('ค้างชำระ')).length;
    const yellowCount = revenueData.filter(d => d.status.includes('🟡') || d.status.includes('ติดตาม')).length;
    const greenCount = revenueData.filter(d => d.status.includes('🟢') || d.status.includes('เสร็จสิ้น')).length;

    document.getElementById('stat-red-count').innerText = `${redCount} เคส`;
    document.getElementById('stat-yellow-count').innerText = `${yellowCount} เคส`;
    document.getElementById('stat-green-count').innerText = `${greenCount} เคส`;
}

// สถิติแยกตามประเภทภาษี และช่วงเวลาจริง (Real-Time)
window.changeTimePeriod = function(period) {
    currentPeriod = period;
    
    // UI Active state
    ['month', 'quarter', 'year'].forEach(p => {
        const btn = document.getElementById(`btn-period-${p}`);
        if(p === period) {
            btn.className = "px-3 py-1.5 rounded-xl font-medium transition-all bg-white text-pink-600 shadow-sm";
        } else {
            btn.className = "px-3 py-1.5 rounded-xl font-medium text-slate-600 hover:text-pink-600 transition-all";
        }
    });

    updateTaxTypeStats();
};

function updateTaxTypeStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentQuarter = Math.floor(currentMonth / 3);

    // Filter items based on real-time dates
    const filteredData = revenueData.filter(item => {
        if (!item.dueDate) return true;
        const itemDate = new Date(item.dueDate);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth();
        const itemQuarter = Math.floor(itemMonth / 3);

        if (currentPeriod === 'month') {
            return itemYear === currentYear && itemMonth === currentMonth;
        } else if (currentPeriod === 'quarter') {
            return itemYear === currentYear && itemQuarter === currentQuarter;
        } else if (currentPeriod === 'year') {
            return itemYear === currentYear;
        }
        return true;
    });

    // Label texts
    const periodTexts = {
        month: 'ประจำเดือนนี้',
        quarter: 'ประจำไตรมาสนี้',
        year: 'ประจำปีนี้'
    };
    document.getElementById('label-land-period').innerText = periodTexts[currentPeriod];
    document.getElementById('label-sign-period').innerText = periodTexts[currentPeriod];

    // Calculate Land Tax
    const landItems = filteredData.filter(i => i.taxType.includes('ที่ดิน'));
    const landTotal = landItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    document.getElementById('stat-land-total').innerText = `฿${landTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('stat-land-count').innerText = `${landItems.length} ราย`;

    // Calculate Sign Tax
    const signItems = filteredData.filter(i => i.taxType.includes('ป้าย'));
    const signTotal = signItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    document.getElementById('stat-sign-total').innerText = `฿${signTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('stat-sign-count').innerText = `${signItems.length} ราย`;
}

// ==========================================
// 4. STAFF SUMMARY & FILTERING
// ==========================================
function renderStaffSummary() {
    const staffMap = {};

    revenueData.forEach(item => {
        const name = item.officer || 'ไม่ระบุ';
        if (!staffMap[name]) {
            staffMap[name] = { total: 0, pending: 0 };
        }
        staffMap[name].total += 1;
        if (!item.status.includes('เสร็จสิ้น')) {
            staffMap[name].pending += 1;
        }
    });

    const grid = document.getElementById('staff-summary-grid');
    grid.innerHTML = '';

    Object.keys(staffMap).forEach(staff => {
        const isSelected = selectedOfficerFilter === staff;
        const card = document.createElement('div');
        card.className = `p-4 rounded-2xl cursor-pointer border-2 transition-all ${
            isSelected 
                ? 'bg-pink-50 border-pink-500 shadow-md' 
                : 'bg-white border-pink-100 hover:border-pink-300'
        }`;
        card.onclick = () => filterByOfficer(staff);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-800 text-sm">${staff}</span>
                <span class="text-xs ${isSelected ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'} px-2 py-0.5 rounded-full">
                    ${staffMap[staff].total} รายการ
                </span>
            </div>
            <p class="text-xs text-slate-500">ค้างดำเนินการ: <strong class="text-rose-500 font-bold">${staffMap[staff].pending}</strong> ราย</p>
        `;
        grid.appendChild(card);
    });
}

function filterByOfficer(officer) {
    if (selectedOfficerFilter === officer) {
        selectedOfficerFilter = null; // Toggle Off
    } else {
        selectedOfficerFilter = officer;
    }
    renderStaffSummary();
    renderDashboardTable();
}

// ==========================================
// 5. TABLE RENDERING WITH HIGHLIGHTED TAX ID
// ==========================================
window.renderDashboardTable = function() {
    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';
    const tbody = document.getElementById('dashboard-data-table');
    tbody.innerHTML = '';

    const filtered = revenueData.filter(item => {
        const matchesSearch = 
            item.name.toLowerCase().includes(searchVal) || 
            item.taxId.toLowerCase().includes(searchVal) ||
            item.taxType.toLowerCase().includes(searchVal);
        
        const matchesOfficer = selectedOfficerFilter ? item.officer === selectedOfficerFilter : true;

        return matchesSearch && matchesOfficer;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">ไม่พบข้อมูลที่ค้นหา</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-pink-50/30 transition-colors";

        tr.innerHTML = `
            <td class="p-3 font-medium">${item.status}</td>
            <td class="p-3">
                <!-- เน้นสีเลขประจำตัวภาษีให้เด่นชัด -->
                <span class="font-bold text-indigo-950 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md tracking-wide">
                    ${item.taxId}
                </span>
            </td>
            <td class="p-3 font-semibold text-slate-800">${item.name}</td>
            <td class="p-3 text-slate-600">${item.taxType} (${item.taxYear})</td>
            <td class="p-3 font-bold text-slate-900">฿${Number(item.amount).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            <td class="p-3 text-slate-600">${item.step}</td>
            <td class="p-3 text-slate-600">${item.officer}</td>
            <td class="p-3 text-center">
                <button onclick="viewCaseDetail('${item.id}')" class="px-3 py-1 bg-pink-100 hover:bg-pink-500 hover:text-white text-pink-600 rounded-xl transition-all font-semibold">
                    <i class="fa-solid fa-eye mr-1"></i> ดูข้อมูล
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// ==========================================
// 6. MODAL & PRINTING FUNCTIONS
// ==========================================
window.viewCaseDetail = function(id) {
    const item = revenueData.find(d => d.id === id);
    if (!item) return;

    const modal = document.getElementById('case-detail-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <div class="space-y-4">
            <div class="border-b pb-3">
                <span class="text-xs text-pink-500 font-bold uppercase tracking-wider">รายละเอียดเคส</span>
                <h3 class="text-xl font-bold text-slate-800">${item.name}</h3>
                <p class="text-xs text-slate-500">${item.address || 'ไม่ระบุที่อยู่'}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="bg-slate-50 p-2.5 rounded-xl">
                    <span class="text-slate-400 block mb-0.5">เลขประจำตัวภาษี</span>
                    <strong class="text-indigo-950 font-bold text-sm">${item.taxId}</strong>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl">
                    <span class="text-slate-400 block mb-0.5">ประเภทภาษี</span>
                    <strong class="text-slate-800">${item.taxType}</strong>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl">
                    <span class="text-slate-400 block mb-0.5">ยอดประเมิน</span>
                    <strong class="text-emerald-600 text-sm">฿${Number(item.amount).toLocaleString('th-TH')}</strong>
                </div>
                <div class="bg-slate-50 p-2.5 rounded-xl">
                    <span class="text-slate-400 block mb-0.5">เจ้าหน้าที่ผู้รับผิดชอบ</span>
                    <strong class="text-slate-800">${item.officer}</strong>
                </div>
            </div>

            <div class="bg-pink-50/50 p-3 rounded-2xl border border-pink-100">
                <span class="text-xs text-slate-500 block">ขั้นตอนปัจจุบัน:</span>
                <p class="font-bold text-pink-600 text-sm mt-0.5">${item.step}</p>
            </div>

            <div class="flex gap-2 pt-2">
                <button onclick="printOfficialDocument('${item.id}')" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-print"></i> พิมพ์หนังสือติดตาม
                </button>
                <button onclick="closeModal()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all">
                    ปิด
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.closeModal = function() {
    document.getElementById('case-detail-modal').classList.add('hidden');
};

// 🖨️ พิมพ์หนังสือแจ้งเตือนรายบุคคล (รูปแบบราชการ TH Sarabun)
window.printOfficialDocument = function(id) {
    const item = revenueData.find(d => d.id === id);
    if (!item) return;

    const printArea = document.getElementById('printable-area');
    const todayTH = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    printArea.innerHTML = `
        <div style="font-family: 'TH Sarabun New', sans-serif; font-size: 16pt; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 22pt; font-weight: bold; margin: 0;">หนังสือแจ้งเตือนชำระภาษี</h2>
                <p style="margin: 0;">หน่วยงานจัดเก็บรายได้ กองคลัง</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>ที่ ชร 52001/..............</div>
                <div>วันที่ ${todayTH}</div>
            </div>

            <div style="margin-bottom: 15px;">
                <strong>เรื่อง:</strong> เตือนให้ดำเนินการชำระ${item.taxType} ประจำปี ${item.taxYear}<br>
                <strong>เรียน:</strong> ${item.name}<br>
                <strong>เลขประจำตัวผู้เสียภาษี:</strong> <span style="font-size: 18pt; font-weight: bold;">${item.taxId}</span>
            </div>

            <p style="text-indent: 2.5cm; text-align: justify; margin-bottom: 15px;">
                ตามที่ท่านมีหน้าที่ต้องชำระ <strong>${item.taxType}</strong> ประจำปี พ.ศ. ${item.taxYear} เป็นจำนวนเงินทั้งสิ้น 
                <strong>${Number(item.amount).toLocaleString('th-TH', {minimumFractionDigits: 2})} บาท</strong> นั้น 
                จากการตรวจสอบระบบข้อมูลพบว่า ปัจจุบันสถานะของท่านอยู่ระหว่าง <em>"${item.step}"</em> และยังไม่ได้ดำเนินการชำระให้เสร็จสิ้นตามกำหนด
            </p>

            <p style="text-indent: 2.5cm; text-align: justify; margin-bottom: 30px;">
                จึงขอเรียนมาเพื่อโปรดติดต่อนำส่งชำระภาษีดังกล่าว ณ กองคลัง ภายใน 15 วัน นับแต่วันที่ได้รับหนังสือฉบับนี้ หากท่านชำระเงินเรียบร้อยแล้วก่อนได้รับหนังสือฉบับนี้ ทางเจ้าหน้าที่ต้องขออภัยมา ณ ที่นี้ด้วย
            </p>

            <div style="display: flex; justify-content: flex-end; margin-top: 50px;">
                <div style="text-align: center; width: 250px;">
                    <p style="margin-bottom: 60px;">ขอแสดงความนับถือ</p>
                    <p style="margin: 0;">(....................................................)</p>
                    <p style="margin: 0;">เจ้าพนักงานจัดเก็บรายได้</p>
                    <p style="margin: 0;">เจ้าหน้าที่ผู้รับผิดชอบ: ${item.officer}</p>
                </div>
            </div>
        </div>
    `;

    window.print();
};

// 🖨️ พิมพ์รายงานสรุปตาราง (รองรับการกรองแยกรายบุคคล)
window.printFilteredReport = function() {
    const printArea = document.getElementById('printable-area');
    const todayTH = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    const filtered = revenueData.filter(item => selectedOfficerFilter ? item.officer === selectedOfficerFilter : true);

    let rowsHTML = filtered.map((item, idx) => `
        <tr style="border-bottom: 1px solid #ddd; text-align: center;">
            <td style="padding: 6px;">${idx + 1}</td>
            <td style="padding: 6px; font-weight: bold;">${item.taxId}</td>
            <td style="padding: 6px; text-align: left;">${item.name}</td>
            <td style="padding: 6px; text-align: left;">${item.taxType}</td>
            <td style="padding: 6px; text-align: right;">${Number(item.amount).toLocaleString('th-TH')}</td>
            <td style="padding: 6px;">${item.status}</td>
            <td style="padding: 6px;">${item.officer}</td>
        </tr>
    `).join('');

    printArea.innerHTML = `
        <div style="font-family: 'TH Sarabun New', sans-serif; font-size: 14pt; padding: 10px;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="font-size: 18pt; font-weight: bold; margin: 0;">รายงานสรุปการติดตามและเร่งรัดจัดเก็บรายได้</h3>
                <p style="margin: 0;">
                    ${selectedOfficerFilter ? `เฉพาะเจ้าหน้าที่: <strong>${selectedOfficerFilter}</strong> | ` : 'เจ้าหน้าที่ทุกคน | '}
                    ข้อมูล ณ วันที่ ${todayTH}
                </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;" border="1">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: center; font-weight: bold;">
                        <th style="padding: 6px;">ลำดับ</th>
                        <th style="padding: 6px;">เลขประจำตัวภาษี</th>
                        <th style="padding: 6px;">ชื่อผู้เสียภาษี</th>
                        <th style="padding: 6px;">ประเภทภาษี</th>
                        <th style="padding: 6px;">ยอดเงิน (บาท)</th>
                        <th style="padding: 6px;">สถานะ</th>
                        <th style="padding: 6px;">เจ้าหน้าที่</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        </div>
    `;

    window.print();
};
