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

// ตั้งค่า URL ของ Google Apps Script Web App สำหรับอัปโหลดรูปภาพ
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw5re9sB07OtORYK4_ZOH3hkXy0u_51GBZ1g6SKBw2PfvVByTbSgUkXrZYrWR6iwjm-Vg/exec";

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
  db.ref('revenue_cases').on('value', (snapshot) => {
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
      const docDateStr = item.docDate || item.date || '';
      const docDate = new Date(docDateStr);
      const officer = item.officerName || item.officer || 'ไม่ระบุชื่อ';

      globalSurveyData.push(item);

      if (!officerStats[officer]) {
        officerStats[officer] = { daily: 0, monthly: 0, quarterly: 0 };
      }

      // สรุปยอดรายวัน
      if (docDateStr === todayStr) {
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

    // อัปเดตตัวเลขการ์ด KPI (ตรวจสอบก่อนว่ามี element นั้นจริงหรือไม่)
    if (document.getElementById('dailyCount')) document.getElementById('dailyCount').textContent = dailyTotal;
    if (document.getElementById('monthlyCount')) document.getElementById('monthlyCount').textContent = monthlyTotal;
    if (document.getElementById('quarterlyCount')) document.getElementById('quarterlyCount').textContent = quarterlyTotal;

    // แสดงผลตารางสรุปผลงาน
    renderOfficerTable(officerStats);
    renderRecentTable(recentRecords.reverse().slice(0, 10));
    updateOfficerDropdown(Object.keys(officerStats));
  });
}

function renderOfficerTable(stats) {
  const tbody = document.getElementById('officerTableBody');
  const printTbody = document.getElementById('printOfficerTable');
  
  if (tbody) {
    tbody.innerHTML = '';
    for (const [officer, stat] of Object.entries(stats)) {
      tbody.innerHTML += `
        <tr class="hover:bg-purple-50/40 transition">
          <td class="p-3 font-semibold text-slate-700">${officer}</td>
          <td class="p-3 text-center font-bold text-emerald-600">${stat.daily}</td>
          <td class="p-3 text-center font-bold text-orange-600">${stat.monthly}</td>
          <td class="p-3 text-center font-bold text-indigo-600">${stat.quarterly}</td>
        </tr>
      `;
    }
  }

  if (printTbody) {
    printTbody.innerHTML = '';
    let index = 1;
    for (const [officer, stat] of Object.entries(stats)) {
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
}

function renderRecentTable(records) {
  const tbody = document.getElementById('recentTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  records.forEach(item => {
    const statusVal = item.followStatus || item.result || '';
    let statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">🟢 พบผู้ค้างภาษี</span>';
    if (statusVal.includes('ไม่พบผู้ค้างภาษี')) {
      statusBadge = '<span class="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">🔴 ไม่พบผู้ค้างภาษี</span>';
    } else if (statusVal.includes('พบบุคคลอื่น')) {
      statusBadge = '<span class="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">🟡 พบบุคคลอื่น</span>';
    }

    tbody.innerHTML += `
      <tr class="hover:bg-amber-50/40 transition">
        <td class="p-3 text-slate-500">${item.docDate || item.date || '-'}</td>
        <td class="p-3 font-medium text-slate-700">${item.officerName || item.officer || '-'}</td>
        <td class="p-3 text-slate-800 font-medium">${item.taxName || item.tax_name || '-'}</td>
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
  const periodFilter = document.getElementById('exportPeriodFilter')?.value || 'all';
  const officerFilter = document.getElementById('exportOfficerFilter')?.value || 'all';

  let filtered = globalSurveyData.filter(item => {
    const docDateStr = item.docDate || item.date || '';
    const docDate = new Date(docDateStr);
    let matchPeriod = true;
    let matchOfficer = true;

    if (periodFilter === 'daily') {
      matchPeriod = (docDateStr === todayStr);
    } else if (periodFilter === 'monthly') {
      matchPeriod = (docDate.getFullYear() === currentYear && docDate.getMonth() === currentMonth);
    } else if (periodFilter === 'quarterly') {
      const itemQuarter = Math.floor(docDate.getMonth() / 3) + 1;
      matchPeriod = (docDate.getFullYear() === currentYear && itemQuarter === currentQuarter);
    }

    const officerName = item.officerName || item.officer || '';
    if (officerFilter !== 'all') {
      matchOfficer = (officerName === officerFilter);
    }

    return matchPeriod && matchOfficer;
  });

  if (filtered.length === 0) {
    alert('ไม่พบข้อมูลตามเงื่อนไขที่เลือกส่งออก');
    return;
  }

  const excelRows = filtered.map((item, index) => ({
    'ลำดับ': index + 1,
    'วันที่สำรวจ': item.docDate || item.date || '',
    'เจ้าหน้าที่ผู้สำรวจ': item.officerName || item.officer || '',
    'รหัสผู้เสียภาษี': item.taxId || '',
    'ชื่อผู้เสียภาษี/ร้านค้า': item.taxName || item.tax_name || '',
    'สถานที่/ที่อยู่': item.address || '',
    'ประเภทภาษี': item.taxType || '',
    'ขั้นตอนเอกสาร': item.docType || '',
    'ปีที่ค้าง': item.overdueYears || '',
    'ผลการติดตาม': item.followStatus || item.result || '',
    'การรับเอกสาร': item.receiptStatus || '',
    'ลิงก์รูปภาพ Drive': item.imageUrl || item.photoUrl || '',
    'หมายเหตุเพิ่มเติม': item.note || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานการลงพื้นที่");

  const fileName = `รายงานการลงพื้นที่_${periodFilter}_${officerFilter}_${todayStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ==========================================
// 3. ฟังก์ชันจัดการรูปภาพ (Compress & Upload)
// ==========================================

function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data);
      };
    };
  });
}

async function uploadImageToDrive(file) {
  const base64Data = await compressImage(file);
  const payload = {
    fileName: `tax_field_${Date.now()}.jpg`,
    mimeType: "image/jpeg",
    base64: base64Data
  };

  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.result === 'success') {
    return result.url;
  } else {
    throw new Error(result.message);
  }
}

function previewImage(event) {
  const file = event.target.files[0];
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');

  if (file && previewContainer && previewImg) {
    previewImg.src = URL.createObjectURL(file);
    previewContainer.classList.remove('hidden');
  } else if (previewContainer) {
    previewContainer.classList.add('hidden');
  }
}

// ==========================================
// 4. ฟังก์ชันฝั่ง Admin Management (admin.html)
// ==========================================

/**
 * ดึงข้อมูล Realtime สำหรับหน้า Admin
 */
function initAdmin() {
  const docDateInput = document.getElementById('docDate');
  if (docDateInput) docDateInput.value = todayStr;

  db.ref('revenue_cases').on('value', (snapshot) => {
    const data = snapshot.val();
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    cachedSurveysObj = data || {};

    if (!data || Object.keys(data).length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">ยังไม่มีประวัติการบันทึกข้อมูล</td></tr>`;
      return;
    }

    const keys = Object.keys(data).reverse();
    keys.forEach(key => {
      const item = data[key];
      const statusVal = item.followStatus || item.result || '';
      const imageUrl = item.imageUrl || item.photoUrl || '';
      
      let statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">🟢 พบผู้ค้างภาษี</span>';
      if (statusVal.includes('ไม่พบผู้ค้างภาษี')) {
        statusBadge = '<span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs font-semibold">🔴 ไม่พบผู้ค้างภาษี</span>';
      } else if (statusVal.includes('พบบุคคลอื่น')) {
        statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-semibold">🟡 พบบุคคลอื่น</span>';
      }

      let imageTd = '<span class="text-xs text-slate-300">- ไม่มีรูป -</span>';
      if (imageUrl) {
        imageTd = `
          <a href="${imageUrl}" target="_blank" title="คลิกเพื่อดูรูปขนาดย่อม">
            <img src="${imageUrl}" class="w-10 h-10 object-cover rounded-lg border border-amber-200 hover:scale-110 transition cursor-pointer">
          </a>
        `;
      }

      tbody.innerHTML += `
        <tr class="hover:bg-amber-50/40 transition">
          <td class="p-3 text-slate-500 text-xs">${item.docDate || item.date || '-'}</td>
          <td class="p-3">${imageTd}</td>
          <td class="p-3 font-medium text-slate-700">${item.officerName || item.officer || '-'}</td>
          <td class="p-3 font-medium text-slate-800">${item.taxName || item.tax_name || '-'}</td>
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
 * บันทึก หรือ แก้ไขข้อมูลใน Firebase (พร้อมระบบอัปโหลดรูปภาพ)
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const statusDiv = document.getElementById('uploadStatus');
  const imageInput = document.getElementById('imageInput');
  const editKey = document.getElementById('editKeyId')?.value;
  let finalImageUrl = document.getElementById('existingImageUrl')?.value || '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }

  try {
    // กรณีเลือกรูปภาพใหม่
    if (imageInput && imageInput.files && imageInput.files[0]) {
      if (statusDiv) statusDiv.classList.remove('hidden');
      finalImageUrl = await uploadImageToDrive(imageInput.files[0]);
      if (statusDiv) statusDiv.classList.add('hidden');
    }

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
      result: document.getElementById('followStatus').value, // บันทึกไว้เผื่อใช้ข้ามฟิลด์
      receiptStatus: document.getElementById('receiptStatus').value,
      note: document.getElementById('note').value,
      imageUrl: finalImageUrl,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    if (editKey) {
      await db.ref('revenue_cases/' + editKey).update(formData);
      alert('อัปเดตข้อมูลเรียบร้อยแล้ว!');
    } else {
      formData.createdAt = firebase.database.ServerValue.TIMESTAMP;
      await db.ref('revenue_cases').push(formData);
      alert('บันทึกข้อมูลและรูปภาพสำเร็จแล้ว!');
    }

    resetForm();

  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    if (statusDiv) statusDiv.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * ดึงข้อมูลเดิมมาใส่ Form เพื่อแก้ไข
 */
function editRecord(key) {
  const item = cachedSurveysObj[key];
  if (!item) return;

  if (document.getElementById('editKeyId')) document.getElementById('editKeyId').value = key;
  if (document.getElementById('existingImageUrl')) document.getElementById('existingImageUrl').value = item.imageUrl || item.photoUrl || '';
  if (document.getElementById('docDate')) document.getElementById('docDate').value = item.docDate || item.date || '';
  if (document.getElementById('officerName')) document.getElementById('officerName').value = item.officerName || item.officer || '';
  if (document.getElementById('taxId')) document.getElementById('taxId').value = item.taxId || '';
  if (document.getElementById('taxName')) document.getElementById('taxName').value = item.taxName || item.tax_name || '';
  if (document.getElementById('address')) document.getElementById('address').value = item.address || '';
  if (document.getElementById('taxType')) document.getElementById('taxType').value = item.taxType || 'ภาษีป้าย';
  if (document.getElementById('docType')) document.getElementById('docType').value = item.docType || 'ลงพื้นที่สำรวจทั่วไป';
  if (document.getElementById('overdueYears')) document.getElementById('overdueYears').value = item.overdueYears || '';
  if (document.getElementById('followStatus')) document.getElementById('followStatus').value = item.followStatus || item.result || 'พบผู้ค้างภาษี';
  if (document.getElementById('receiptStatus')) document.getElementById('receiptStatus').value = item.receiptStatus || 'ผู้ค้างภาษีรับเอง';
  if (document.getElementById('note')) document.getElementById('note').value = item.note || '';

  // แสดงรูปตัวอย่างเดิม (ถ้ามี)
  const existingUrl = item.imageUrl || item.photoUrl || '';
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');
  if (existingUrl && previewContainer && previewImg) {
    previewImg.src = existingUrl;
    previewContainer.classList.remove('hidden');
  } else if (previewContainer) {
    previewContainer.classList.add('hidden');
  }

  // ปรับสถานะ UI เข้าสู่โหมดแก้ไข
  if (document.getElementById('formTitle')) document.getElementById('formTitle').innerHTML = '<span>✏️</span> แก้ไขข้อมูลการลงพื้นที่';
  if (document.getElementById('editBadge')) document.getElementById('editBadge').classList.remove('hidden');
  if (document.getElementById('submitBtn')) {
    document.getElementById('submitBtn').innerHTML = '💾 บันทึกการแก้ไข';
    document.getElementById('submitBtn').className = 'bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition shadow-md flex-1';
  }
  if (document.getElementById('cancelEditBtn')) document.getElementById('cancelEditBtn').classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// เพื่อให้รองรับชื่อฟังก์ชันเดิมใน admin.html
function editCase(key) {
  editRecord(key);
}

/**
 * ลบรายการออกจาก Firebase
 */
function deleteRecord(key) {
  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
    db.ref('revenue_cases/' + key).remove()
      .then(() => alert('ลบรายการเรียบร้อยแล้ว'))
      .catch(err => alert('เกิดข้อผิดพลาด: ' + err.message));
  }
}

// เพื่อให้รองรับชื่อฟังก์ชันเดิมใน admin.html
function deleteCase(key) {
  deleteRecord(key);
}

/**
 * ล้างข้อมูลใน Form
 */
function resetForm() {
  const form = document.getElementById('surveyForm');
  if (form) form.reset();
  
  if (document.getElementById('editKeyId')) document.getElementById('editKeyId').value = '';
  if (document.getElementById('existingImageUrl')) document.getElementById('existingImageUrl').value = '';
  if (document.getElementById('docDate')) document.getElementById('docDate').value = todayStr;
  if (document.getElementById('imagePreviewContainer')) document.getElementById('imagePreviewContainer').classList.add('hidden');

  if (document.getElementById('formTitle')) document.getElementById('formTitle').innerHTML = '<span>📝</span> กรอกข้อมูลการลงพื้นที่สำรวจ';
  if (document.getElementById('editBadge')) document.getElementById('editBadge').classList.add('hidden');
  if (document.getElementById('submitBtn')) {
    document.getElementById('submitBtn').innerHTML = '➕ บันทึกข้อมูล';
    document.getElementById('submitBtn').className = 'bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition shadow-md flex-1';
  }
  if (document.getElementById('cancelEditBtn')) document.getElementById('cancelEditBtn').classList.add('hidden');
}
