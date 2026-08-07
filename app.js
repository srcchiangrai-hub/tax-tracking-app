// ==========================================
// 1. Firebase Configuration & Initialization
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCWPTSuhl_TGkRQr0_K3AnyjbnBJTlbm4s",
  authDomain: "tax-tracking-app-25fb7.firebaseapp.com",
  databaseURL: "https://tax-tracking-app-25fb7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tax-tracking-app-25fb7",
  storageBucket: "tax-tracking-app-25fb7.firebasestorage.app",
  messagingSenderId: "122118718226",
  appId: "1:122118718226:web:df2d284fe543ec799da9cb"
};

// ตรวจสอบการ Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// ตัวแปรส่วนกลางสำหรับจัดการช่วงเวลา
const now = new Date();
const todayStr = now.toISOString().split('T')[0];
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const currentQuarter = Math.floor(currentMonth / 3) + 1;

// ตัวแปรสำหรับคลังเก็บ ข้อมูล Realtime
let globalSurveyData = [];
let cachedSurveysObj = {};

// ==========================================
// 2. ฟังก์ชันฝั่ง Dashboard (index.html)
// ==========================================

/**
 * ดึงข้อมูล Realtime สำหรับหน้า Dashboard
 */
function initDashboard() {
  db.ref('surveys').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      showEmptyStateDashboard();
      return;
    }

    let dailyTotal = 0;
    let monthlyTotal = 0;
    let quarterlyTotal = 0;
    let officerStats = {};
    let recentRecords = [];
    globalSurveyData = [];

    Object.keys(data).forEach(key => {
      const item = data[key];
      const docDate = new Date(item.docDate);
      const officer = item.officerName || 'ไม่ระบุชื่อ';

      globalSurveyData.push(item);

      if (!officerStats[officer]) {
        officerStats[officer] = { daily: 0, monthly: 0, quarterly: 0 };
      }

      // สรุปยอดรายวัน
      if (item.docDate === todayStr) {
        dailyTotal++;
        officerStats[officer].daily++;
      }

      // สรุปยอดรายเดือน
      if (docDate.getFullYear() === currentYear && docDate.getMonth() === currentMonth) {
        monthlyTotal++;
        officerStats[officer].monthly++;
      }

      // สรุปยอดรายไตรมาส
      const itemQuarter = Math.floor(docDate.getMonth() / 3) + 1;
      if (docDate.getFullYear() === currentYear && itemQuarter === currentQuarter) {
        quarterlyTotal++;
        officerStats[officer].quarterly++;
      }

      recentRecords.push(item);
    });

    // อัปเดตตัวเลขการ์ด KPI
    document.getElementById('dailyCount').textContent = dailyTotal;
    document.getElementById('monthlyCount').textContent = monthlyTotal;
    document.getElementById('quarterlyCount').textContent = quarterlyTotal;

    // แสดงผลตารางสรุปผลงาน
    renderOfficerTable(officerStats);
    renderRecentTable(recentRecords.reverse().slice(0, 10));
    updateOfficerDropdown(Object.keys(officerStats));
  });
}

function renderOfficerTable(stats) {
  const tbody = document.getElementById('officerTableBody');
  const printTbody = document.getElementById('printOfficerTable');
  if (!tbody || !printTbody) return;

  tbody.innerHTML = '';
  printTbody.innerHTML = '';

  let index = 1;
  for (const [officer, stat] of Object.entries(stats)) {
    tbody.innerHTML += `
      <tr class="hover:bg-purple-50/40 transition">
        <td class="p-3 font-semibold text-slate-700">${officer}</td>
        <td class="p-3 text-center font-bold text-emerald-600">${stat.daily}</td>
        <td class="p-3 text-center font-bold text-orange-600">${stat.monthly}</td>
        <td class="p-3 text-center font-bold text-indigo-600">${stat.quarterly}</td>
      </tr>
    `;

    printTbody.innerHTML += `
      <tr>
        <td class="border border-black p-1.5 text-center">${index++}</td>
        <td class="border border-black p-1.5">${officer}</td>
        <td class="border border-black p-1.5 text-center">${stat.daily}</td>
        <td class="border border-black p-1.5 text-center">${stat.monthly}</td>
        <td class="border border-black p-1.5 text-center">${stat.quarterly}</td>
      </tr>
    `;
  }
}

function renderRecentTable(records) {
  const tbody = document.getElementById('recentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  records.forEach(item => {
    let statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">🟢 พบผู้ค้างภาษี</span>';
    if (item.followStatus === 'ไม่พบผู้ค้างภาษี') {
      statusBadge = '<span class="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">🔴 ไม่พบผู้ค้างภาษี</span>';
    } else if (item.followStatus === 'พบบุคคลอื่น') {
      statusBadge = '<span class="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">🟡 พบบุคคลอื่น</span>';
    }

    tbody.innerHTML += `
      <tr class="hover:bg-amber-50/40 transition">
        <td class="p-3 text-slate-500">${item.docDate || '-'}</td>
        <td class="p-3 font-medium text-slate-700">${item.officerName || '-'}</td>
        <td class="p-3 text-slate-800 font-medium">${item.taxName || '-'}</td>
        <td class="p-3">${statusBadge}</td>
        <td class="p-3 text-slate-600">${item.receiptStatus || '-'}</td>
        <td class="p-3 text-slate-500 text-xs">${item.note || '-'}</td>
      </tr>
    `;
  });
}

function updateOfficerDropdown(officerList) {
  const select = document.getElementById('exportOfficerFilter');
  if (!select) return;
  select.innerHTML = '<option value="all">👷‍♂️ เจ้าหน้าที่ทั้งหมด</option>';
  officerList.forEach(name => {
    select.innerHTML += `<option value="${name}">${name}</option>`;
  });
}

function showEmptyStateDashboard() {
  const tbody1 = document.getElementById('officerTableBody');
  const tbody2 = document.getElementById('recentTableBody');
  if (tbody1) tbody1.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400">ยังไม่มีข้อมูลการสำรวจในระบบ</td></tr>`;
  if (tbody2) tbody2.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">ยังไม่มีข้อมูลการสำรวจในระบบ</td></tr>`;
}

/**
 * ส่งออกไฟล์ Excel แบบกรองข้อมูล
 */
function exportFilteredExcel() {
  const periodFilter = document.getElementById('exportPeriodFilter').value;
  const officerFilter = document.getElementById('exportOfficerFilter').value;

  let filtered = globalSurveyData.filter(item => {
    const docDate = new Date(item.docDate);
    let matchPeriod = true;
    let matchOfficer = true;

    if (periodFilter === 'daily') {
      matchPeriod = (item.docDate === todayStr);
    } else if (periodFilter === 'monthly') {
      matchPeriod = (docDate.getFullYear() === currentYear && docDate.getMonth() === currentMonth);
    } else if (periodFilter === 'quarterly') {
      const itemQuarter = Math.floor(docDate.getMonth() / 3) + 1;
      matchPeriod = (docDate.getFullYear() === currentYear && itemQuarter === currentQuarter);
    }

    if (officerFilter !== 'all') {
      matchOfficer = (item.officerName === officerFilter);
    }

    return matchPeriod && matchOfficer;
  });

  if (filtered.length === 0) {
    alert('ไม่พบข้อมูลตามเงื่อนไขที่เลือกส่งออก');
    return;
  }

  const excelRows = filtered.map((item, index) => ({
    'ลำดับ': index + 1,
    'วันที่สำรวจ': item.docDate || '',
    'เจ้าหน้าที่ผู้สำรวจ': item.officerName || '',
    'รหัสผู้เสียภาษี': item.taxId || '',
    'ชื่อผู้เสียภาษี/ร้านค้า': item.taxName || '',
    'สถานที่/ที่อยู่': item.address || '',
    'ประเภทภาษี': item.taxType || '',
    'ขั้นตอนเอกสาร': item.docType || '',
    'ปีที่ค้าง': item.overdueYears || '',
    'ผลการติดตาม': item.followStatus || '',
    'การรับเอกสาร': item.receiptStatus || '',
    'หมายเหตุเพิ่มเติม': item.note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานการลงพื้นที่");

  const fileName = `รายงานการลงพื้นที่_${periodFilter}_${officerFilter}_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ==========================================
// 3. ฟังก์ชันฝั่ง Admin Management (admin.html)
// ==========================================

/**
 * ดึงข้อมูล Realtime สำหรับหน้า Admin
 */
function initAdmin() {
  const docDateInput = document.getElementById('docDate');
  if (docDateInput) docDateInput.value = todayStr;

  db.ref('surveys').on('value', (snapshot) => {
    const data = snapshot.val();
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    cachedSurveysObj = data || {};

    if (!data) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">ยังไม่มีประวัติการบันทึกข้อมูล</td></tr>`;
      return;
    }

    const keys = Object.keys(data).reverse();
    keys.forEach(key => {
      const item = data[key];
      
      let statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">🟢 พบผู้ค้างภาษี</span>';
      if (item.followStatus === 'ไม่พบผู้ค้างภาษี') {
        statusBadge = '<span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs font-semibold">🔴 ไม่พบผู้ค้างภาษี</span>';
      } else if (item.followStatus === 'พบบุคคลอื่น') {
        statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">🟡 พบบุคคลอื่น</span>';
      }

      tbody.innerHTML += `
        <tr class="hover:bg-amber-50/40 transition">
          <td class="p-3 text-slate-500">${item.docDate || '-'}</td>
          <td class="p-3 font-medium text-slate-700">${item.officerName || '-'}</td>
          <td class="p-3 font-medium text-slate-800">${item.taxName || '-'}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-center space-x-1">
            <button onclick="editRecord('${key}')" class="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1 rounded-xl text-xs font-semibold transition">✏️ แก้ไข</button>
            <button onclick="deleteRecord('${key}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 rounded-xl text-xs font-semibold transition">🗑️ ลบ</button>
          </td>
        </tr>
      `;
    });
  });
}

/**
 * บันทึก หรือ แก้ไขข้อมูลใน Firebase
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const editKey = document.getElementById('editKeyId').value;

  const formData = {
    docDate: document.getElementById('docDate').value,
    officerName: document.getElementById('officerName').value,
    taxId: document.getElementById('taxId').value,
    taxName: document.getElementById('taxName').value,
    address: document.getElementById('address').value,
    taxType: document.getElementById('taxType').value,
    docType: document.getElementById('docType').value,
    overdueYears: document.getElementById('overdueYears').value,
    followStatus: document.getElementById('followStatus').value,
    receiptStatus: document.getElementById('receiptStatus').value,
    note: document.getElementById('note').value,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  if (editKey) {
    db.ref('surveys/' + editKey).update(formData)
      .then(() => {
        alert('อัปเดตข้อมูลเรียบร้อยแล้ว!');
        resetForm();
      })
      .catch(err => alert('เกิดข้อผิดพลาด: ' + err.message));
  } else {
    formData.createdAt = firebase.database.ServerValue.TIMESTAMP;
    db.ref('surveys').push(formData)
      .then(() => {
        alert('บันทึกข้อมูลสำเร็จ!');
        resetForm();
      })
      .catch(err => alert('เกิดข้อผิดพลาด: ' + err.message));
  }
}

/**
 * ดึงข้อมูลเดิมมาใส่ Form เพื่อแก้ไข
 */
function editRecord(key) {
  const item = cachedSurveysObj[key];
  if (!item) return;

  document.getElementById('editKeyId').value = key;
  document.getElementById('docDate').value = item.docDate || '';
  document.getElementById('officerName').value = item.officerName || '';
  document.getElementById('taxId').value = item.taxId || '';
  document.getElementById('taxName').value = item.taxName || '';
  document.getElementById('address').value = item.address || '';
  document.getElementById('taxType').value = item.taxType || 'ภาษีป้าย';
  document.getElementById('docType').value = item.docType || 'ลงพื้นที่สำรวจทั่วไป';
  document.getElementById('overdueYears').value = item.overdueYears || '';
  document.getElementById('followStatus').value = item.followStatus || 'พบผู้ค้างภาษี';
  document.getElementById('receiptStatus').value = item.receiptStatus || 'ผู้ค้างภาษีรับเอง';
  document.getElementById('note').value = item.note || '';

  document.getElementById('formTitle').innerHTML = '<span>✏️</span> แก้ไขข้อมูลการสำรวจ';
  document.getElementById('editBadge').classList.remove('hidden');
  document.getElementById('submitBtn').innerHTML = '💾 บันทึกการแก้ไข';
  document.getElementById('submitBtn').className = 'bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition shadow-md flex-1';
  document.getElementById('cancelEditBtn').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * ลบรายการออกจาก Firebase
 */
function deleteRecord(key) {
  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
    db.ref('surveys/' + key).remove()
      .then(() => alert('ลบรายการเรียบร้อยแล้ว'))
      .catch(err => alert('เกิดข้อผิดพลาด: ' + err.message));
  }
}

/**
 * ล้างข้อมูลใน Form
 */
function resetForm() {
  const form = document.getElementById('surveyForm');
  if (form) form.reset();
  
  document.getElementById('editKeyId').value = '';
  document.getElementById('docDate').value = todayStr;

  document.getElementById('formTitle').innerHTML = '<span>📝</span> กรอกข้อมูลการลงพื้นที่สำรวจ';
  document.getElementById('editBadge').classList.add('hidden');
  document.getElementById('submitBtn').innerHTML = '➕ บันทึกข้อมูล';
  document.getElementById('submitBtn').className = 'bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition shadow-md flex-1';
  document.getElementById('cancelEditBtn').classList.add('hidden');
}
