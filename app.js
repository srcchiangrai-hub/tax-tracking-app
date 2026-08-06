
การสนทนากับ Gemini
ผมจะสร้างแดชบอร์ดรายงานการออกพื้นที่เร่งรัดภาษีป้าย กับที่ดินสิ่งปลูกสร้าง โดย มี 2 ส่วนคือ เมนูให้เจ้าหน้าที่กรอกกับแดชบอร์ดให้ผู้บริหารดู โดยเชื่อม firestore กับ githup โดยมีไฟล์ 3 ส่วนคือ admin.html app.js index.html ยังไม่ต้องสร้างโค้ด ผมจะบอกเมนูก่อนว่าต้องการอะไรบ้าง

รับทราบครับ สถาปัตยกรรมและโครงสร้างไฟล์ที่คุณวางไว้ถือว่าเหมาะสมมากสำหรับการใช้งานแบบ Web App น้ำหนักเบาที่ดึงข้อมูลจาก Firebase Firestore มาแสดงผล

โครงสร้างระบบที่สรุปไว้:

admin.html: หน้าสำหรับเจ้าหน้าที่กรอกข้อมูลการออกพื้นที่

index.html: หน้าแดชบอร์ดสรุปผลและ visualization สำหรับผู้บริหาร

app.js: ส่วนควบคุม Logic การเชื่อมต่อ Firestore และการประมวลผลข้อมูล

ส่งรายละเอียดของ เมนู ฟิลด์ข้อมูลที่ต้องการให้กรอก หรือ ตัวชี้วัด (KPIs) ที่ผู้บริหารต้องการเห็น มาได้เลยครับ เดี๋ยวผมจะช่วยออกแบบโครงสร้างข้อมูล (Data Structure) และผังการทำงานให้ก่อนครับ

น้าแอดมินจะมีเมนู ชนิดภาษี ภดส. หรือป้าย รหัส ชื่อสกุล บ้านเลขที่ ตรอก ซอย ถนน/ตำบล อำเภอ จังหวัด เพื่อส้งหนังสือ มีให้้เลือก แจ้งประเมิณ / แจ้งเตือน ผลการออกติดตาม มีให้เลือก ไม่พบผู้ค้างภาษี พบผู้ค้างภาษี บุคคลอื่น โปรดระบุ และช่องกรอก ชื่อคนบันทึกกับตำแหน่ง ประมาณนี้ คุณช่วย ออกแบบเพิ่มเติมหน่อย แล้วมีระบบอัพรูปจากมือถือ และระบบปริ้นตามแบบราชการ

ระบบที่คุณออกแบบไว้ครอบคลุมกระบวนการทำงานในภาคสนามได้ดีมากครับ เพื่อให้ระบบสมบูรณ์ ทำงานได้จริงในทางปฏิบัติ และรองรับการนำไปทำ Dashboard สำหรับผู้บริหาร ผมขอช่วย ออกแบบเพิ่มเติม ปรับโครงสร้างข้อมูล พร้อมเสนอแนวทางการจัดการ ระบบอัปโหลดรูปภาพ และ ระบบพิมพ์หนังสือตามแบบราชการ ดังนี้ครับ

1. การออกแบบฟิลด์ข้อมูลเพิ่มเติม (Data Field Design)
เพื่อให้การบันทึกข้อมูลสมบูรณ์และนำไปแสดงผลบน Dashboard ได้แม่นยำ ควรเพิ่มฟิลด์เหล่านี้เข้าไปด้วยครับ:

ส่วนที่ 1: ข้อมูลการประเมินและสถานะภาษี (ปรับปรุง)
ประเภทภาษี (Tax Type): ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.) / ภาษีป้าย

เลขประจำตัวผู้เสียภาษี / เลขบัตรประชาชน / เลขนิติบุคคล: (ควรเพิ่ม เพื่อเชื่อมโยงฐานข้อมูลเดิม)

แปลงที่ดิน / เลขที่แปลง (UTM / R-Code): (ถ้ามี สำหรับภาษีที่ดิน)

ส่วนที่ 2: ข้อมูลสถานที่ส่งหนังสือ / ออกติดตาม (ปรับปรุง)
ข้อมูลที่อยู่: รหัสผู้เสียภาษี, ชื่อ-นามสกุล, บ้านเลขที่, หมู่ที่ (เพิ่มหมู่), ตรอก, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์ (เพิ่มสำหรับส่งจดหมาย)

พิกัด GPS (Geo-location): กดปุ่มเพื่อบันทึก Latitude, Longitude จากมือถือขณะออกพื้นที่ทันที (สำคัญมากสำหรับทำแผนที่บน Dashboard)

ส่วนที่ 3: วัตถุประสงค์การออกติดตาม / เอกสารที่นำส่ง
ประเภทหนังสือที่นำส่ง:

หนังสือแจ้งการประเมิน (ภ.ด.ส. 6 / ป้าย)

หนังสือแจ้งเตือนค้างชำระ (เตือนครั้งที่ 1 / เตือนครั้งที่ 2)

หนังสือแจ้งหนังสือการประเมินภาษีแบบลงทะเบียนตอบรับ

ปีภาษีที่ติดตาม: (เช่น 2567, 2568, 2569)

ยอดเงินภาษีค้างชำระ (บาท): (ควรมีช่องกรอก เพื่อนำไปคำนวณยอดเงินรวมบน Dashboard ผู้บริหาร)

ส่วนที่ 4: ผลการออกติดตาม (ปรับปรุง)
ผลการติดตาม (Status):

ไม่พบผู้ค้างชำระ / ไม่เจอตัว

พบผู้ค้างชำระ (บุคคลเดิม)

พบผู้อยู่อาศัยอื่น / ผู้เชี่ยว / ผู้รับเรื่องแทน (โปรดระบุชื่อ-ความสัมพันธ์)

ร้าง / ย้ายออก / หาไม่พบตามที่อยู่

แนวโน้มการชำระเงิน (Action Taken):

ยินยอมชำระทันที / นัดชำระวันที่...

ขอผ่อนชำระ

คัดค้านการประเมิน

ปฏิเสธการชำระ / ยืนยันไม่ชำระ

หมายเหตุ / รายละเอียดเพิ่มเติม: (Text Area สำหรับกรอกคำอธิบายเพิ่มเติม)

ส่วนที่ 5: ข้อมูลผู้บันทึกและระบบอัตโนมัติ
วันที่และเวลาออกพื้นที่: (ดึงจากระบบอัตโนมัติ Auto Timestamp)

ชื่อผู้บันทึก: (กรอก หรือ ดึงจากระบบ Login)

ตำแหน่งผู้บันทึก: (เช่น นักวิชาการจัดเก็บรายได้, เจ้าพนักงานจัดเก็บรายได้)

2. แนวทางระบบอัปโหลดรูปภาพจากมือถือ (Photo Upload System)
เนื่องจากคุณใช้ Firebase Firestore ในการเก็บข้อมูลข้อความ รูปภาพขนาดใหญ่จะไม่สามารถเก็บใน Firestore ตรงๆ ได้ ควรจัดการดังนี้:

ตัวเลือกที่ 1: ใช้ Firebase Storage (แนะนำ)

เมื่อถ่ายรูปจากมือถือผ่าน <input type="file" accept="image/*" capture="environment">

รูปจะถูกอัปโหลดขึ้น Firebase Storage

ระบบจะส่งคืนลิงก์รูปภาพ (Image URL) กลับมาบันทึกลงใน Firestore

ประเภทรูปที่ควรให้ถ่ายอัปโหลด:

รูปภาพแปลงที่ดิน / ป้ายภาษี

รูปภาพสภาพบ้าน / อาคารขณะไปติดตาม

รูปภาพการติดหนังสือ / การมอบหนังสือให้ผู้รับเรื่อง

3. แนวทางระบบพิมพ์หนังสือตามแบบราชการ (Official Print / Report)
สำหรับการพิมพ์หนังสือแจ้งประเมิน หรือใบติดตามที่เป็นแบบฟอร์มราชการ (เช่น ขนาด A4 มีตราครุฑ) ผ่านหน้าเว็บ:

ใช้ HTML + CSS Print Stylesheet (@media print):

ออกแบบ Template หน้าหนังสือราชการไว้ในหน้าเว็บโดยกดปุ่ม "พิมพ์หนังสือ"

ซ่อนส่วนที่เป็นเมนูและปุ่มกด เหลือไว้เฉพาะตัวหนังสือ A4

รองรับการแปลงข้อมูลจากฟิลด์ที่กรอก (ชื่อ, ที่อยู่, ยอดเงิน) เข้าไปแทนที่ในแบบฟอร์มทันที

ใช้ไลบรารีสร้าง PDF (jsPDF / html2pdf.js):

แปลงหน้าฟอร์มราชการบนเว็บให้กลายเป็นไฟล์ PDF เพื่อดาวน์โหลด หรือสั่งพิมพ์ออกทางเครื่องพิมพ์ (Printer) ได้ทันที

4. สรุปภาพรวม Dashboard สำหรับผู้บริหาร (Index.html Preview)
เพื่อให้เห็นภาพว่าข้อมูลที่กรอกใน admin.html จะนำไปโชว์อะไรใน index.html ได้บ้าง:

Cards สรุปยอด (KPIs): ยอดออกติดตามทั้งหมด, จำนวนผู้ชำระแล้ว, ยอดเงินภาษีค้างชำระที่ติดตามได้ (แยกตาม ภ.ด.ส. และ ป้าย)

กราฟแท่ง/วงกลม (Charts): สัดส่วนผลการติดตาม (พบตัว / ไม่พบตัว / ขอผ่อนชำระ)

แผนที่หมุดพิกัด (Map View): แสดงจุดที่เจ้าหน้าที่ลงพื้นที่ติดตามจริงผ่าน GPS

ตารางสรุปผล (Data Table): ค้นหาและ Filter ตามชื่อเจ้าหน้าที่, ประเภทภาษี, หรือตำบล/ถนนได้

เมื่อคุณตรวจสอบรายการฟิลด์และระบบเสริมเหล่านี้แล้ว หากต้องการให้ปรับเปลี่ยน หรือเพิ่ม/ลดตรงไหน แจ้งได้เลยครับ! เมื่อเรียบร้อยแล้วเราจะเริ่มลุยในส่วนของการวาง Data Structure บน Firestore และเขียนโค้ดต่อไปครับ

งันเริมเริ่มมาเริ่มเขียนโค้ดเลยครับ ค่อยปรับใช้กันหน้างาน

จัดไปครับ! เรามาเริ่มลุยเขียนโค้ดทั้ง 3 ไฟล์ตามโครงสร้างที่คุณต้องการกันเลย โดยผมจะวางระบบเชื่อมต่อ Firebase Firestore (v9/v10 Modular SDK) ไว้ให้เรียบร้อยแล้ว พร้อมระบบถ่ายรูปด้วยกล้องมือถือแปลงเป็น Base64 (ไม่ต้องเปิด Firebase Storage ให้ยุ่งยาก) และฟังก์ชั่นกดพิมพ์หนังสือราชการมาตรฐาน A4 ครับ

1. admin.html (หน้าบันทึกข้อมูลสำหรับเจ้าหน้าที่)
หน้าสำหรับกรอกข้อมูล รองรับการกดดึงพิกัด GPS ถ่ายภาพจากกล้องมือถือ และสั่งพิมพ์หนังสือราชการได้ทันที

HTML
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ระบบบันทึกการออกติดตามภาษี</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body * { visibility: hidden; }
      #printArea, #printArea * { visibility: visible; }
      #printArea { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-slate-100 font-sans p-4 md:p-8">
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 no-print">
    <h2 class="text-2xl font-bold text-slate-800 border-b pb-3 mb-6">📝 บันทึกข้อมูลการออกติดตามภาษี</h2>
    
    <form id="taxForm" class="space-y-4">
      <!-- ชนิดภาษี -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทภาษี *</label>
          <select id="taxType" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required>
            <option value="">-- เลือกประเภทภาษี --</option>
            <option value="ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)">ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)</option>
            <option value="ภาษีป้าย">ภาษีป้าย</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ประเภทหนังสือที่นำส่ง *</label>
          <select id="docType" class="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" required>
            <option value="แจ้งประเมิน">แจ้งประเมิน</option>
            <option value="แจ้งเตือนค้างชำระ">แจ้งเตือนค้างชำระ</option>
          </select>
        </div>
      </div>

      <!-- ข้อมูลผู้เสียภาษี -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผู้เสียภาษี / เลขแปลง</label>
          <input type="text" id="taxId" class="w-full border rounded-lg p-2.5" placeholder="เช่น P-1234">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
          <input type="text" id="fullName" class="w-full border rounded-lg p-2.5" placeholder="นายสมชาย ใจดี" required>
        </div>
      </div>

      <!-- ที่อยู่ -->
      <div class="border-t pt-4">
        <h3 class="font-semibold text-slate-700 mb-2">ที่อยู่ส่งหนังสือ / ที่อยู่ออกติดตาม</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="text" id="houseNo" placeholder="บ้านเลขที่" class="border rounded-lg p-2 text-sm">
          <input type="text" id="trok" placeholder="ตรอก" class="border rounded-lg p-2 text-sm">
          <input type="text" id="soi" placeholder="ซอย" class="border rounded-lg p-2 text-sm">
          <input type="text" id="road" placeholder="ถนน/ตำบล *" class="border rounded-lg p-2 text-sm" required>
          <input type="text" id="district" placeholder="อำเภอ *" class="border rounded-lg p-2 text-sm" required>
          <input type="text" id="province" placeholder="จังหวัด *" class="border rounded-lg p-2 text-sm" required>
          <input type="number" id="taxAmount" placeholder="ยอดเงินค้าง (บาท)" class="border rounded-lg p-2 text-sm col-span-2">
        </div>
      </div>

      <!-- พิกัด GPS -->
      <div class="border-t pt-4">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-slate-700">พิกัดสถานที่ออกติดตาม (GPS)</label>
          <button type="button" id="btnGps" class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-100">📍 ดึงพิกัดปัจจุบัน</button>
        </div>
        <input type="text" id="location" class="w-full border rounded-lg p-2 bg-slate-50 text-sm" readonly placeholder="ยังไม่ได้ดึงพิกัด">
      </div>

      <!-- ผลการติดตาม -->
      <div class="border-t pt-4 space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ผลการออกติดตาม *</label>
          <select id="followResult" class="w-full border rounded-lg p-2.5" required>
            <option value="พบผู้ค้างภาษี">พบผู้ค้างภาษี</option>
            <option value="ไม่พบผู้ค้างภาษี">ไม่พบผู้ค้างภาษี</option>
            <option value="บุคคลอื่น">พบบุคคลอื่น (ระบุ)</option>
          </select>
        </div>
        <input type="text" id="otherDetail" placeholder="โปรดระบุชื่อผู้รับเรื่องแทน / รายละเอียดเพิ่มเติม" class="w-full border rounded-lg p-2 text-sm">
      </div>

      <!-- ถ่ายรูปจากมือถือ -->
      <div class="border-t pt-4">
        <label class="block text-sm font-medium text-slate-700 mb-1">แนบรูปถ่ายการลงพื้นที่ (จากกล้องมือถือ)</label>
        <input type="file" id="imageInput" accept="image/*" capture="environment" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
        <img id="imagePreview" class="mt-2 max-h-48 rounded-lg hidden border">
      </div>

      <!-- ผู้บันทึก -->
      <div class="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้บันทึก *</label>
          <input type="text" id="reporterName" class="w-full border rounded-lg p-2.5" placeholder="ชื่อ-นามสกุล เจ้าหน้าที่" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ตำแหน่ง *</label>
          <input type="text" id="reporterPosition" class="w-full border rounded-lg p-2.5" placeholder="นักวิชาการจัดเก็บรายได้" required>
        </div>
      </div>

      <!-- ปุ่มดำเนินการ -->
      <div class="pt-4 flex flex-col sm:flex-row gap-3">
        <button type="submit" id="btnSubmit" class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 shadow">💾 บันทึกข้อมูลลง Firestore</button>
        <button type="button" id="btnPrint" class="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 shadow">🖨️ แสดงแบบพิมพ์หนังสือ</button>
      </div>
    </form>
  </div>

  <!-- พื้นที่หนังสือพิมพ์แบบราชการ (พิมพ์ลง A4) -->
  <div id="printArea" class="hidden p-8 max-w-2xl mx-auto bg-white font-serif leading-relaxed text-black">
    <div class="text-center font-bold text-xl mb-6">บันทึกการออกติดตามการชำระภาษี</div>
    <div class="text-right mb-4" id="pDate">วันที่ ...../...../..........</div>
    <div class="mb-4">
      <p><strong>เรื่อง:</strong> การออกติดตาม <span id="pTaxType"></span></p>
      <p><strong>เรียน:</strong> <span id="pFullName"></span> (รหัส: <span id="pTaxId"></span>)</p>
      <p><strong>ที่อยู่:</strong> <span id="pAddress"></span></p>
    </div>
    <div class="mb-4 indent-8">
      ด้วย เจ้าหน้าที่ได้ลงพื้นที่ออกติดตามการชำระภาษี และได้ดำเนินการแจ้ง <span id="pDocType"></span> ยอดเงินค้างชำระประเมินจำนวน <span id="pAmount"></span> บาท โดยผลการติดตามพบว่า: <span id="pResult"></span> (<span id="pOther"></span>)
    </div>
    <div class="mt-16 text-right pr-8">
      <p>ลงชื่อ..........................................................</p>
      <p>( <span id="pReporter"></span> )</p>
      <p>ตำแหน่ง <span id="pPosition"></span></p>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
2. index.html (หน้าแดชบอร์ดสำหรับผู้บริหาร)
หน้าจอแสดงภาพรวม สรุปยอด KPIs สถิติผลการติดตาม และตารางตารางประวัติการลงพื้นที่

HTML
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard ผู้บริหาร - รายงานการเร่งรัดภาษี</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js สำหรับทำกราฟ -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-slate-100 font-sans p-4 md:p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">📊 แดชบอร์ดติดตามการเร่งรัดภาษี</h1>
        <p class="text-sm text-slate-500">ภาษีที่ดินและสิ่งปลูกสร้าง / ภาษีป้าย</p>
      </div>
      <a href="admin.html" class="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100">➕ ไปหน้าลงบันทึก</a>
    </header>

    <!-- Cards สรุป KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
        <p class="text-sm text-slate-500">ออกติดตามทั้งหมด</p>
        <p id="kpiTotal" class="text-3xl font-bold text-slate-800">0 <span class="text-sm font-normal">ครั้ง</span></p>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
        <p class="text-sm text-slate-500">พบผู้ค้างภาษี</p>
        <p id="kpiFound" class="text-3xl font-bold text-green-600">0 <span class="text-sm font-normal">ราย</span></p>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-amber-500">
        <p class="text-sm text-slate-500">ไม่พบ / บุคคลอื่น</p>
        <p id="kpiNotFound" class="text-3xl font-bold text-amber-600">0 <span class="text-sm font-normal">ราย</span></p>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
        <p class="text-sm text-slate-500">ยอดภาษีค้างชำระรวม</p>
        <p id="kpiAmount" class="text-3xl font-bold text-purple-600">0 <span class="text-sm font-normal">บาท</span></p>
      </div>
    </div>

    <!-- กราฟสรุปผล -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-5 rounded-xl shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4">สัดส่วนแยกตามประเภทภาษี</h3>
        <canvas id="typeChart" class="max-h-60"></canvas>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4">สรุปผลการออกติดตาม</h3>
        <canvas id="resultChart" class="max-h-60"></canvas>
      </div>
    </div>

    <!-- ตารางตารางประวัติ -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-5 border-b">
        <h3 class="font-bold text-slate-700">รายการออกติดตามล่าสุด</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="p-3 border-b">วันที่/เวลา</th>
              <th class="p-3 border-b">ประเภทภาษี</th>
              <th class="p-3 border-b">ชื่อ-นามสกุล</th>
              <th class="p-3 border-b">ที่อยู่/พื้นที่</th>
              <th class="p-3 border-b">ผลการติดตาม</th>
              <th class="p-3 border-b">ยอดเงิน</th>
              <th class="p-3 border-b">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody id="dataTable" class="divide-y text-slate-700">
            <tr><td colspan="7" class="p-4 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
3. app.js (ไฟล์เชื่อมต่อ Firebase และควบคุมการทำงานทั้งหมด)
⚠️ ข้อแนะนำ: อย่าลืมนำ Firebase Config Values ของโครงการคุณมาวางแทนที่ตรง firebaseConfig ด้านล่างนี้ด้วยนะครับ

JavaScript
// นำเข้า Firebase SDK (v10 Modern ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 วาง Firebase Config ของคุณตรงนี้
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

// ตัวแปรเก็บรูปภาพแปลงเป็น Base64
let imageBase64 = "";

// ----------------------------------------------------
// Logic สำหรับหน้า admin.html
// ----------------------------------------------------
if (document.getElementById("taxForm")) {
  
  // 1. ดึงพิกัด GPS
  document.getElementById("btnGps").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        document.getElementById("location").value = coords;
      }, () => alert("ไม่สามารถดึงพิกัด GPS ได้"));
    } else {
      alert("เบราว์เซอร์ไม่รองรับ GPS");
    }
  });

  // 2. แปลงรูปถ่ายเป็น Base64
  document.getElementById("imageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageBase64 = reader.result;
        const img = document.getElementById("imagePreview");
        img.src = imageBase64;
        img.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // 3. บันทึกข้อมูลลง Firestore
  document.getElementById("taxForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById("btnSubmit");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ กำลังบันทึก...";

    try {
      const docData = {
        taxType: document.getElementById("taxType").value,
        docType: document.getElementById("docType").value,
        taxId: document.getElementById("taxId").value,
        fullName: document.getElementById("fullName").value,
        address: {
          houseNo: document.getElementById("houseNo").value,
          trok: document.getElementById("trok").value,
          soi: document.getElementById("soi").value,
          road: document.getElementById("road").value,
          district: document.getElementById("district").value,
          province: document.getElementById("province").value,
        },
        taxAmount: parseFloat(document.getElementById("taxAmount").value) || 0,
        location: document.getElementById("location").value,
        followResult: document.getElementById("followResult").value,
        otherDetail: document.getElementById("otherDetail").value,
        imageUrl: imageBase64,
        reporterName: document.getElementById("reporterName").value,
        reporterPosition: document.getElementById("reporterPosition").value,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "tax_records"), docData);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
      document.getElementById("taxForm").reset();
      document.getElementById("imagePreview").classList.add("hidden");
      imageBase64 = "";
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "💾 บันทึกข้อมูลลง Firestore";
    }
  });

  // 4. พิมพ์หนังสือราชการ
  document.getElementById("btnPrint").addEventListener("click", () => {
    document.getElementById("pTaxType").innerText = document.getElementById("taxType").value;
    document.getElementById("pFullName").innerText = document.getElementById("fullName").value;
    document.getElementById("pTaxId").innerText = document.getElementById("taxId").value || "-";
    document.getElementById("pDocType").innerText = document.getElementById("docType").value;
    document.getElementById("pAmount").innerText = document.getElementById("taxAmount").value || "0";
    document.getElementById("pResult").innerText = document.getElementById("followResult").value;
    document.getElementById("pOther").innerText = document.getElementById("otherDetail").value || "ไม่มี";
    document.getElementById("pReporter").innerText = document.getElementById("reporterName").value;
    document.getElementById("pPosition").innerText = document.getElementById("reporterPosition").value;
    
    const addr = `บ้านเลขที่ ${document.getElementById("houseNo").value} ตรอก/ซอย ${document.getElementById("soi").value} ถนน/ตำบล ${document.getElementById("road").value} อ.${document.getElementById("district").value} จ.${document.getElementById("province").value}`;
    document.getElementById("pAddress").innerText = addr;
    document.getElementById("pDate").innerText = `วันที่ ${new Date().toLocaleDateString('th-TH')}`;

    const printArea = document.getElementById("printArea");
    printArea.classList.remove("hidden");
    window.print();
    printArea.classList.add("hidden");
  });
}

// ----------------------------------------------------
// Logic สำหรับหน้า index.html (Dashboard)
// ----------------------------------------------------
if (document.getElementById("dataTable")) {
  async function loadDashboardData() {
    try {
      const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      let total = 0, found = 0, notFound = 0, sumAmount = 0;
      let taxTypeCount = { "ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)": 0, "ภาษีป้าย": 0 };
      let resultCount = { "พบผู้ค้างภาษี": 0, "ไม่พบผู้ค้างภาษี": 0, "บุคคลอื่น": 0 };

      const tableBody = document.getElementById("dataTable");
      tableBody.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        sumAmount += data.taxAmount || 0;

        // สถิติผลการติดตาม
        if (data.followResult === "พบผู้ค้างภาษี") found++;
        else notFound++;

        if (taxTypeCount[data.taxType] !== undefined) taxTypeCount[data.taxType]++;
        if (resultCount[data.followResult] !== undefined) resultCount[data.followResult]++;

        // เติมข้อมูลลงตาราง
        const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('th-TH') : '-';
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50";
        tr.innerHTML = `
          <td class="p-3 border-b">${dateStr}</td>
          <td class="p-3 border-b"><span class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">${data.taxType || '-'}</span></td>
          <td class="p-3 border-b font-medium">${data.fullName}</td>
          <td class="p-3 border-b">${data.address?.road || ''} ${data.address?.district || ''}</td>
          <td class="p-3 border-b">${data.followResult}</td>
          <td class="p-3 border-b font-semibold text-purple-700">${(data.taxAmount || 0).toLocaleString()}</td>
          <td class="p-3 border-b text-slate-500">${data.reporterName || '-'}</td>
        `;
        tableBody.appendChild(tr);
      });

      // อัปเดต KPIs
      document.getElementById("kpiTotal").innerHTML = `${total} <span class="text-sm font-normal">ครั้ง</span>`;
      document.getElementById("kpiFound").innerHTML = `${found} <span class="text-sm font-normal">ราย</span>`;
      document.getElementById("kpiNotFound").innerHTML = `${notFound} <span class="text-sm font-normal">ราย</span>`;
      document.getElementById("kpiAmount").innerHTML = `${sumAmount.toLocaleString()} <span class="text-sm font-normal">บาท</span>`;

      // วาดกราฟ
      renderCharts(taxTypeCount, resultCount);

    } catch (err) {
      console.error("Error loading dashboard: ", err);
    }
  }

  function renderCharts(taxTypes, results) {
    // กราฟวงกลมประเภทภาษี
    new Chart(document.getElementById("typeChart"), {
      type: "doughnut",
      data: {
        labels: Object.keys(taxTypes),
        datasets: [{ data: Object.values(taxTypes), backgroundColor: ["#3B82F6", "#10B981"] }]
      }
    });

    // กราฟแท่งผลการติดตาม
    new Chart(document.getElementById("resultChart"), {
      type: "bar",
      data: {
        labels: Object.keys(results),
        datasets: [{ label: 'จำนวน (ราย)', data: Object.values(results), backgroundColor: ["#10B981", "#F59E0B", "#6B7280"] }]
      }
    });
  }

  loadDashboardData();
}
คุณสามารถก๊อปปี้โค้ดทั้ง 3 ส่วนนี้ไปสร้างไฟล์ admin.html, index.html, และ app.js บน Project แล้วอัปโหลดขึ้น GitHub Pages เพื่อทดสอบรันหน้างานจริงได้เลยครับ หากต้องการปรับสไตล์ ปรับข้อความหนังสือพิมพ์ หรือเปลี่ยนเงื่อนไขอะไรเพิ่มเติม แจ้งมาได้เลยครับ!

ขอธีมแบบน่ารักๆสดใส หน่อยครับโค้ดที่ให้มามัันทื่อเกินไป

จัดให้ครับ! ปรับโฉมใหม่ให้สดใส น่ารัก ละมุนตา ไม่น่าเบื่อ (โทนสี Pastel Pink, Soft Purple, Mint Green และ Creamy Yellow) แต่ยังคงฟังก์ชั่นครบถ้วน บันทึกข้อมูล ดึง GPS ถ่ายรูป และสั่งพิมพ์ได้เหมือนเดิมครับ

1. admin.html (ธีมน่ารัก สดใส สไตล์ Pastel)
HTML
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌸 บันทึกการออกติดตามภาษี</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Mali', cursive, sans-serif; }
    @media print {
      body * { visibility: hidden; }
      #printArea, #printArea * { visibility: visible; }
      #printArea { position: absolute; left: 0; top: 0; width: 100%; font-family: 'TH Sarabun PSK', sans-serif; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="bg-rose-50/60 text-slate-700 p-4 md:p-8 min-h-screen">
  <div class="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border-4 border-pink-200 p-6 md:p-8 no-print">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <span class="inline-block bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold mb-2 shadow-sm">
        ✨ Tax Field Tracking App ✨
      </span>
      <h2 class="text-2xl md:text-3xl font-bold text-pink-500 flex items-center justify-center gap-2">
        📝 บันทึกข้อมูลการออกติดตามภาษี
      </h2>
      <p class="text-slate-400 text-sm mt-1">กรอกข้อมูลลงพื้นที่ให้ครบถ้วนเลยน้าา ~</p>
    </div>
    
    <form id="taxForm" class="space-y-5">
      <!-- ชนิดภาษี -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-pink-600 mb-1.5">🏷️ ประเภทภาษี *</label>
          <select id="taxType" class="w-full bg-pink-50/50 border-2 border-pink-200 rounded-2xl p-3 focus:outline-none focus:border-pink-400 transition" required>
            <option value="">-- เลือกประเภทภาษี --</option>
            <option value="ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)">🏡 ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)</option>
            <option value="ภาษีป้าย">🪧 ภาษีป้าย</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-purple-600 mb-1.5">✉️ ประเภทหนังสือที่นำส่ง *</label>
          <select id="docType" class="w-full bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-3 focus:outline-none focus:border-purple-400 transition" required>
            <option value="แจ้งประเมิน">📩 แจ้งประเมิน</option>
            <option value="แจ้งเตือนค้างชำระ">🔔 แจ้งเตือนค้างชำระ</option>
          </select>
        </div>
      </div>

      <!-- ข้อมูลผู้เสียภาษี -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-1.5">🆔 รหัสผู้เสียภาษี / เลขแปลง</label>
          <input type="text" id="taxId" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" placeholder="เช่น P-1234">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-bold text-slate-600 mb-1.5">👤 ชื่อ-นามสกุล ผู้ค้างภาษี *</label>
          <input type="text" id="fullName" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" placeholder="คุณสมชาย ใจดี" required>
        </div>
      </div>

      <!-- ที่อยู่ -->
      <div class="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
        <h3 class="font-bold text-amber-700 flex items-center gap-1.5 text-sm">📍 ที่อยู่ส่งหนังสือ / ที่อยู่ออกติดตาม</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <input type="text" id="houseNo" placeholder="บ้านเลขที่" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">
          <input type="text" id="trok" placeholder="ตรอก" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">
          <input type="text" id="soi" placeholder="ซอย" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">
          <input type="text" id="road" placeholder="ถนน/ตำบล *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>
          <input type="text" id="district" placeholder="อำเภอ *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>
          <input type="text" id="province" placeholder="จังหวัด *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>
          <input type="number" id="taxAmount" placeholder="💰 ยอดค้าง (บาท)" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm col-span-2 font-bold text-pink-500">
        </div>
      </div>

      <!-- พิกัด GPS -->
      <div class="bg-teal-50/60 p-4 rounded-2xl border-2 border-teal-200 space-y-2">
        <div class="flex items-center justify-between">
          <label class="block text-sm font-bold text-teal-700">📌 พิกัดสถานที่ออกติดตาม (GPS)</label>
          <button type="button" id="btnGps" class="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1">
            📍 ดึงพิกัดตอนนี้
          </button>
        </div>
        <input type="text" id="location" class="w-full bg-white border border-teal-200 rounded-xl p-2.5 text-sm text-teal-700 font-mono" readonly placeholder="กดปุ่มเพื่อกดดึงพิกัด GPS หน้างาน">
      </div>

      <!-- ผลการติดตาม -->
      <div class="space-y-2">
        <label class="block text-sm font-bold text-slate-600 mb-1">🎯 ผลการออกติดตาม *</label>
        <select id="followResult" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" required>
          <option value="พบผู้ค้างภาษี">✅ พบผู้ค้างภาษี</option>
          <option value="ไม่พบผู้ค้างภาษี">❌ ไม่พบผู้ค้างภาษี</option>
          <option value="บุคคลอื่น">🙋🏻‍♀️ พบบุคคลอื่น (โปรดระบุ)</option>
        </select>
        <input type="text" id="otherDetail" placeholder="ระบุรายละเอียดเพิ่มเติม หรือ ชื่อผู้รับเรื่องแทน..." class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5 text-sm">
      </div>

      <!-- ถ่ายรูปจากมือถือ -->
      <div class="border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/30">
        <label class="block text-sm font-bold text-pink-500 mb-2">📸 ถ่ายรูปหน้างาน (เปิดกล้องมือถือได้เลย)</label>
        <input type="file" id="imageInput" accept="image/*" capture="environment" class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-400 file:text-white hover:file:bg-pink-500 cursor-pointer">
        <img id="imagePreview" class="mt-3 max-h-48 mx-auto rounded-xl hidden border-2 border-pink-300 shadow-md">
      </div>

      <!-- ผู้บันทึก -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-1.5">🎀 ชื่อผู้บันทึก *</label>
          <input type="text" id="reporterName" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3" placeholder="ชื่อ-สกุล เจ้าหน้าที่" required>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-600 mb-1.5">💼 ตำแหน่ง *</label>
          <input type="text" id="reporterPosition" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3" placeholder="นักวิชาการจัดเก็บรายได้" required>
        </div>
      </div>

      <!-- ปุ่มดำเนินการ -->
      <div class="pt-2 flex flex-col sm:flex-row gap-3">
        <button type="submit" id="btnSubmit" class="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition">
          💖 บันทึกข้อมูลเข้าระบบ
        </button>
        <button type="button" id="btnPrint" class="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition">
          🖨️ พิมพ์หนังสือ
        </button>
      </div>
    </form>
  </div>

  <!-- พื้นที่สำหรับพิมพ์หนังสือราชการ -->
  <div id="printArea" class="hidden p-8 max-w-2xl mx-auto bg-white leading-relaxed text-black">
    <div class="text-center font-bold text-2xl mb-6">บันทึกการออกติดตามการชำระภาษี</div>
    <div class="text-right mb-4" id="pDate">วันที่ ...../...../..........</div>
    <div class="mb-4 space-y-1">
      <p><strong>เรื่อง:</strong> การออกติดตาม <span id="pTaxType"></span></p>
      <p><strong>เรียน:</strong> <span id="pFullName"></span> (รหัสผู้เสียภาษี: <span id="pTaxId"></span>)</p>
      <p><strong>ที่อยู่:</strong> <span id="pAddress"></span></p>
    </div>
    <div class="mb-6 indent-8">
      ด้วย เจ้าหน้าที่ได้ลงพื้นที่ออกติดตามการชำระภาษี และได้ดำเนินการแจ้ง <span id="pDocType"></span> ยอดเงินค้างชำระประเมินจำนวน <span id="pAmount"></span> บาท โดยผลการติดตามพบว่า: <span id="pResult"></span> (<span id="pOther"></span>)
    </div>
    <div class="mt-20 text-right pr-8 space-y-1">
      <p>ลงชื่อ..........................................................</p>
      <p>( <span id="pReporter"></span> )</p>
      <p>ตำแหน่ง <span id="pPosition"></span></p>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
2. index.html (แดชบอร์ดผู้บริหาร สไตล์น่ารัก ตกแต่งการ์ด & กราฟสดใส)
HTML
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎀 Executive Dashboard - สรุปภาษี</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Mali', cursive, sans-serif; }
  </style>
</head>
<body class="bg-purple-50/50 text-slate-700 p-4 md:p-8 min-h-screen">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Top Header Bar -->
    <header class="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-100 shadow-sm gap-4">
      <div class="text-center md:text-left">
        <span class="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold mb-1">Executive Summary</span>
        <h1 class="text-2xl md:text-3xl font-bold text-purple-600">📊 แดชบอร์ดติดตามเร่งรัดภาษี</h1>
        <p class="text-xs text-slate-400">ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.) & ภาษีป้าย</p>
      </div>
      <a href="admin.html" class="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition shadow-md shadow-pink-200">
        ✏️ ไปหน้าบันทึกข้อมูล
      </a>
    </header>

    <!-- Stat Cards 4 สไตล์ Soft Pastel -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-3xl border-2 border-blue-200 shadow-sm relative overflow-hidden">
        <span class="text-2xl absolute right-3 top-3 opacity-40">🚀</span>
        <p class="text-xs font-bold text-blue-500 mb-1">ออกติดตามรวม</p>
        <p id="kpiTotal" class="text-3xl font-bold text-blue-700">0 <span class="text-xs font-normal text-slate-400">ครั้ง</span></p>
      </div>
      <div class="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-3xl border-2 border-emerald-200 shadow-sm relative overflow-hidden">
        <span class="text-2xl absolute right-3 top-3 opacity-40">🎉</span>
        <p class="text-xs font-bold text-emerald-500 mb-1">พบผู้ค้างภาษี</p>
        <p id="kpiFound" class="text-3xl font-bold text-emerald-600">0 <span class="text-xs font-normal text-slate-400">ราย</span></p>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-amber-200 shadow-sm relative overflow-hidden">
        <span class="text-2xl absolute right-3 top-3 opacity-40">🔍</span>
        <p class="text-xs font-bold text-amber-500 mb-1">ไม่พบ / บุคคลอื่น</p>
        <p id="kpiNotFound" class="text-3xl font-bold text-amber-600">0 <span class="text-xs font-normal text-slate-400">ราย</span></p>
      </div>
      <div class="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-3xl border-2 border-pink-200 shadow-sm relative overflow-hidden">
        <span class="text-2xl absolute right-3 top-3 opacity-40">💎</span>
        <p class="text-xs font-bold text-pink-500 mb-1">ยอดภาษีค้างรวม</p>
        <p id="kpiAmount" class="text-3xl font-bold text-pink-600">0 <span class="text-xs font-normal text-slate-400">บาท</span></p>
      </div>
    </div>

    <!-- กราฟแสดงสถิติ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">🍰 สัดส่วนตามประเภทภาษี</h3>
        <canvas id="typeChart" class="max-h-60"></canvas>
      </div>
      <div class="bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-sm">
        <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2">📈 สรุปผลการออกติดตาม</h3>
        <canvas id="resultChart" class="max-h-60"></canvas>
      </div>
    </div>

    <!-- ตารางตารางประวัติ -->
    <div class="bg-white rounded-3xl border-2 border-purple-100 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-purple-50 bg-purple-50/30">
        <h3 class="font-bold text-purple-700 flex items-center gap-2">📑 ประวัติการออกลงพื้นที่ล่าสุด</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-purple-100/50 text-purple-800">
            <tr>
              <th class="p-3.5">วันที่/เวลา</th>
              <th class="p-3.5">ประเภทภาษี</th>
              <th class="p-3.5">ชื่อ-นามสกุล</th>
              <th class="p-3.5">พื้นที่/ที่อยู่</th>
              <th class="p-3.5">ผลติดตาม</th>
              <th class="p-3.5">ยอดเงินค้าง</th>
              <th class="p-3.5">เจ้าหน้าที่</th>
            </tr>
          </thead>
          <tbody id="dataTable" class="divide-y divide-purple-50 text-slate-600">
            <tr><td colspan="7" class="p-6 text-center text-slate-400">กำลังโหลดข้อมูลน่ารักๆ ให้คุณผู้บริหาร... ✨</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
3. app.js (ปรับโทนสีกราฟเป็นสี พาสเทล ละมุนตา)
สคริปต์นี้เหมือนเดิมทุกประการในเรื่องระบบ Firestore และฟังก์ชั่นการทำงาน แต่ปรับเปลี่ยนสีของกราฟ Chart.js เป็นโทนสดใสหวานๆ ครับ:

JavaScript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 อย่าลืมวาง Firebase Config ของคุณตรงนี้
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let imageBase64 = "";

// ----------------------------------------------------
// Logic สำหรับหน้า admin.html
// ----------------------------------------------------
if (document.getElementById("taxForm")) {
  
  // ดึง GPS
  document.getElementById("btnGps").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        document.getElementById("location").value = coords;
      }, () => alert("ไม่สามารถดึงพิกัด GPS ได้ค่ะ"));
    } else {
      alert("เบราว์เซอร์ไม่รองรับ GPS");
    }
  });

  // แปลงรูปถ่ายเป็น Base64
  document.getElementById("imageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageBase64 = reader.result;
        const img = document.getElementById("imagePreview");
        img.src = imageBase64;
        img.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // บันทึก Firestore
  document.getElementById("taxForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById("btnSubmit");
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ กำลังบันทึกน้าา...";

    try {
      const docData = {
        taxType: document.getElementById("taxType").value,
        docType: document.getElementById("docType").value,
        taxId: document.getElementById("taxId").value,
        fullName: document.getElementById("fullName").value,
        address: {
          houseNo: document.getElementById("houseNo").value,
          trok: document.getElementById("trok").value,
          soi: document.getElementById("soi").value,
          road: document.getElementById("road").value,
          district: document.getElementById("district").value,
          province: document.getElementById("province").value,
        },
        taxAmount: parseFloat(document.getElementById("taxAmount").value) || 0,
        location: document.getElementById("location").value,
        followResult: document.getElementById("followResult").value,
        otherDetail: document.getElementById("otherDetail").value,
        imageUrl: imageBase64,
        reporterName: document.getElementById("reporterName").value,
        reporterPosition: document.getElementById("reporterPosition").value,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "tax_records"), docData);
      alert("✨ บันทึกข้อมูลสำเร็จเรียบร้อยแล้วค่ะ!");
      document.getElementById("taxForm").reset();
      document.getElementById("imagePreview").classList.add("hidden");
      imageBase64 = "";
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "💖 บันทึกข้อมูลเข้าระบบ";
    }
  });

  // พิมพ์แบบราชการ
  document.getElementById("btnPrint").addEventListener("click", () => {
    document.getElementById("pTaxType").innerText = document.getElementById("taxType").value;
    document.getElementById("pFullName").innerText = document.getElementById("fullName").value;
    document.getElementById("pTaxId").innerText = document.getElementById("taxId").value || "-";
    document.getElementById("pDocType").innerText = document.getElementById("docType").value;
    document.getElementById("pAmount").innerText = document.getElementById("taxAmount").value || "0";
    document.getElementById("pResult").innerText = document.getElementById("followResult").value;
    document.getElementById("pOther").innerText = document.getElementById("otherDetail").value || "ไม่มี";
    document.getElementById("pReporter").innerText = document.getElementById("reporterName").value;
    document.getElementById("pPosition").innerText = document.getElementById("reporterPosition").value;
    
    const addr = `บ้านเลขที่ ${document.getElementById("houseNo").value} ตรอก/ซอย ${document.getElementById("soi").value} ถนน/ตำบล ${document.getElementById("road").value} อ.${document.getElementById("district").value} จ.${document.getElementById("province").value}`;
    document.getElementById("pAddress").innerText = addr;
    document.getElementById("pDate").innerText = `วันที่ ${new Date().toLocaleDateString('th-TH')}`;

    const printArea = document.getElementById("printArea");
    printArea.classList.remove("hidden");
    window.print();
    printArea.classList.add("hidden");
  });
}

// ----------------------------------------------------
// Logic หน้า Dashboard
// ----------------------------------------------------
if (document.getElementById("dataTable")) {
  async function loadDashboardData() {
    try {
      const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      let total = 0, found = 0, notFound = 0, sumAmount = 0;
      let taxTypeCount = { "ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)": 0, "ภาษีป้าย": 0 };
      let resultCount = { "พบผู้ค้างภาษี": 0, "ไม่พบผู้ค้างภาษี": 0, "บุคคลอื่น": 0 };

      const tableBody = document.getElementById("dataTable");
      tableBody.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        sumAmount += data.taxAmount || 0;

        if (data.followResult === "พบผู้ค้างภาษี") found++;
        else notFound++;

        if (taxTypeCount[data.taxType] !== undefined) taxTypeCount[data.taxType]++;
        if (resultCount[data.followResult] !== undefined) resultCount[data.followResult]++;

        const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('th-TH') : '-';
        const tr = document.createElement("tr");
        tr.className = "hover:bg-pink-50/40 transition";
        tr.innerHTML = `
          <td class="p-3.5">${dateStr}</td>
          <td class="p-3.5"><span class="px-2.5 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">${data.taxType || '-'}</span></td>
          <td class="p-3.5 font-bold text-slate-700">${data.fullName}</td>
          <td class="p-3.5 text-xs text-slate-500">${data.address?.road || ''} ${data.address?.district || ''}</td>
          <td class="p-3.5 font-semibold">${data.followResult}</td>
          <td class="p-3.5 font-bold text-pink-500">${(data.taxAmount || 0).toLocaleString()} ฿</td>
          <td class="p-3.5 text-xs text-slate-400">${data.reporterName || '-'}</td>
        `;
        tableBody.appendChild(tr);
      });

      document.getElementById("kpiTotal").innerHTML = `${total} <span class="text-xs font-normal text-slate-400">ครั้ง</span>`;
      document.getElementById("kpiFound").innerHTML = `${found} <span class="text-xs font-normal text-slate-400">ราย</span>`;
      document.getElementById("kpiNotFound").innerHTML = `${notFound} <span class="text-xs font-normal text-slate-400">ราย</span>`;
      document.getElementById("kpiAmount").innerHTML = `${sumAmount.toLocaleString()} <span class="text-xs font-normal text-slate-400">บาท</span>`;

      renderCharts(taxTypeCount, resultCount);

    } catch (err) {
      console.error("Error loading dashboard: ", err);
    }
  }

  function renderCharts(taxTypes, results) {
    // กราฟวงกลมพาสเทล
    new Chart(document.getElementById("typeChart"), {
      type: "doughnut",
      data: {
        labels: Object.keys(taxTypes),
        datasets: [{ 
          data: Object.values(taxTypes), 
          backgroundColor: ["#F472B6", "#38BDF8"] // Pink & Sky Blue Pastel
        }]
      }
    });

    // กราฟแท่งพาสเทล
    new Chart(document.getElementById("resultChart"), {
      type: "bar",
      data: {
        labels: Object.keys(results),
        datasets: [{ 
          label: 'จำนวน (ราย)', 
          data: Object.values(results), 
          backgroundColor: ["#34D399", "#FBBF24", "#A78BFA"], // Emerald, Amber, Purple Pastel
          borderRadius: 12
        }]
      }
    });
  }

  loadDashboardData();
}
<!DOCTYPE html>

<html lang="th">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>🌸 บันทึกการออกติดตามภาษี</title>

  <script src="https://cdn.tailwindcss.com"></script>

  <link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>

    body { font-family: 'Mali', cursive, sans-serif; }

    @media print {

      body * { visibility: hidden; }

      #printArea, #printArea * { visibility: visible; }

      #printArea { position: absolute; left: 0; top: 0; width: 100%; font-family: 'TH Sarabun PSK', sans-serif; }

      .no-print { display: none !important; }

    }

  </style>

</head>

<body class="bg-rose-50/60 text-slate-700 p-4 md:p-8 min-h-screen">

  <div class="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border-4 border-pink-200 p-6 md:p-8 no-print">

    

    <!-- Header -->

    <div class="text-center mb-8">

      <span class="inline-block bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold mb-2 shadow-sm">

        ✨ Tax Field Tracking App ✨

      </span>

      <h2 class="text-2xl md:text-3xl font-bold text-pink-500 flex items-center justify-center gap-2">

        📝 บันทึกข้อมูลการออกติดตามภาษี

      </h2>

      <p class="text-slate-400 text-sm mt-1">กรอกข้อมูลลงพื้นที่ให้ครบถ้วนเลยน้าา ~</p>

    </div>

    

    <form id="taxForm" class="space-y-5">

      <!-- ชนิดภาษี -->

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>

          <label class="block text-sm font-bold text-pink-600 mb-1.5">🏷️ ประเภทภาษี *</label>

          <select id="taxType" class="w-full bg-pink-50/50 border-2 border-pink-200 rounded-2xl p-3 focus:outline-none focus:border-pink-400 transition" required>

            <option value="">-- เลือกประเภทภาษี --</option>

            <option value="ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)">🏡 ภาษีที่ดินและสิ่งปลูกสร้าง (ภ.ด.ส.)</option>

            <option value="ภาษีป้าย">🪧 ภาษีป้าย</option>

          </select>

        </div>

        <div>

          <label class="block text-sm font-bold text-purple-600 mb-1.5">✉️ ประเภทหนังสือที่นำส่ง *</label>

          <select id="docType" class="w-full bg-purple-50/50 border-2 border-purple-200 rounded-2xl p-3 focus:outline-none focus:border-purple-400 transition" required>

            <option value="แจ้งประเมิน">📩 แจ้งประเมิน</option>

            <option value="แจ้งเตือนค้างชำระ">🔔 แจ้งเตือนค้างชำระ</option>

          </select>

        </div>

      </div>



      <!-- ข้อมูลผู้เสียภาษี -->

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>

          <label class="block text-sm font-bold text-slate-600 mb-1.5">🆔 รหัสผู้เสียภาษี / เลขแปลง</label>

          <input type="text" id="taxId" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" placeholder="เช่น P-1234">

        </div>

        <div class="md:col-span-2">

          <label class="block text-sm font-bold text-slate-600 mb-1.5">👤 ชื่อ-นามสกุล ผู้ค้างภาษี *</label>

          <input type="text" id="fullName" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" placeholder="คุณสมชาย ใจดี" required>

        </div>

      </div>



      <!-- ที่อยู่ -->

      <div class="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-200 space-y-3">

        <h3 class="font-bold text-amber-700 flex items-center gap-1.5 text-sm">📍 ที่อยู่ส่งหนังสือ / ที่อยู่ออกติดตาม</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">

          <input type="text" id="houseNo" placeholder="บ้านเลขที่" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">

          <input type="text" id="trok" placeholder="ตรอก" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">

          <input type="text" id="soi" placeholder="ซอย" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm">

          <input type="text" id="road" placeholder="ถนน/ตำบล *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>

          <input type="text" id="district" placeholder="อำเภอ *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>

          <input type="text" id="province" placeholder="จังหวัด *" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm" required>

          <input type="number" id="taxAmount" placeholder="💰 ยอดค้าง (บาท)" class="bg-white border border-amber-200 rounded-xl p-2.5 text-sm col-span-2 font-bold text-pink-500">

        </div>

      </div>



      <!-- พิกัด GPS -->

      <div class="bg-teal-50/60 p-4 rounded-2xl border-2 border-teal-200 space-y-2">

        <div class="flex items-center justify-between">

          <label class="block text-sm font-bold text-teal-700">📌 พิกัดสถานที่ออกติดตาม (GPS)</label>

          <button type="button" id="btnGps" class="bg-teal-400 hover:bg-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1">

            📍 ดึงพิกัดตอนนี้

          </button>

        </div>

        <input type="text" id="location" class="w-full bg-white border border-teal-200 rounded-xl p-2.5 text-sm text-teal-700 font-mono" readonly placeholder="กดปุ่มเพื่อกดดึงพิกัด GPS หน้างาน">

      </div>



      <!-- ผลการติดตาม -->

      <div class="space-y-2">

        <label class="block text-sm font-bold text-slate-600 mb-1">🎯 ผลการออกติดตาม *</label>

        <select id="followResult" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-pink-300" required>

          <option value="พบผู้ค้างภาษี">✅ พบผู้ค้างภาษี</option>

          <option value="ไม่พบผู้ค้างภาษี">❌ ไม่พบผู้ค้างภาษี</option>

          <option value="บุคคลอื่น">🙋🏻‍♀️ พบบุคคลอื่น (โปรดระบุ)</option>

        </select>

        <input type="text" id="otherDetail" placeholder="ระบุรายละเอียดเพิ่มเติม หรือ ชื่อผู้รับเรื่องแทน..." class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5 text-sm">

      </div>



      <!-- ถ่ายรูปจากมือถือ -->

      <div class="border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/30">

        <label class="block text-sm font-bold text-pink-500 mb-2">📸 ถ่ายรูปหน้างาน (เปิดกล้องมือถือได้เลย)</label>

        <input type="file" id="imageInput" accept="image/*" capture="environment" class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-pink-400 file:text-white hover:file:bg-pink-500 cursor-pointer">

        <img id="imagePreview" class="mt-3 max-h-48 mx-auto rounded-xl hidden border-2 border-pink-300 shadow-md">

      </div>



      <!-- ผู้บันทึก -->

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>

          <label class="block text-sm font-bold text-slate-600 mb-1.5">🎀 ชื่อผู้บันทึก *</label>

          <input type="text" id="reporterName" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3" placeholder="ชื่อ-สกุล เจ้าหน้าที่" required>

        </div>

        <div>

          <label class="block text-sm font-bold text-slate-600 mb-1.5">💼 ตำแหน่ง *</label>

          <input type="text" id="reporterPosition" class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3" placeholder="นักวิชาการจัดเก็บรายได้" required>

        </div>

      </div>



      <!-- ปุ่มดำเนินการ -->

      <div class="pt-2 flex flex-col sm:flex-row gap-3">

        <button type="submit" id="btnSubmit" class="flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition">

          💖 บันทึกข้อมูลเข้าระบบ

        </button>

        <button type="button" id="btnPrint" class="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition">

          🖨️ พิมพ์หนังสือ

        </button>

      </div>

    </form>

  </div>



  <!-- พื้นที่สำหรับพิมพ์หนังสือราชการ -->

  <div id="printArea" class="hidden p-8 max-w-2xl mx-auto bg-white leading-relaxed text-black">

    <div class="text-center font-bold text-2xl mb-6">บันทึกการออกติดตามการชำระภาษี</div>

    <div class="text-right mb-4" id="pDate">วันที่ ...../...../..........</div>

    <div class="mb-4 space-y-1">

      <p><strong>เรื่อง:</strong> การออกติดตาม <span id="pTaxType"></span></p>

      <p><strong>เรียน:</strong> <span id="pFullName"></span> (รหัสผู้เสียภาษี: <span id="pTaxId"></span>)</p>

      <p><strong>ที่อยู่:</strong> <span id="pAddress"></span></p>

    </div>

    <div class="mb-6 indent-8">

      ด้วย เจ้าหน้าที่ได้ลงพื้นที่ออกติดตามการชำระภาษี และได้ดำเนินการแจ้ง <span id="pDocType"></span> ยอดเงินค้างชำระประเมินจำนวน <span id="pAmount"></span> บาท โดยผลการติดตามพบว่า: <span id="pResult"></span> (<span id="pOther"></span>)

    </div>

    <div class="mt-20 text-right pr-8 space-y-1">

      <p>ลงชื่อ..........................................................</p>

      <p>( <span id="pReporter"></span> )</p>

      <p>ตำแหน่ง <span id="pPosition"></span></p>

    </div>

  </div>



  <script type="module" src="app.js"></script>

</body>

</html>เพิ่มเมนูแก้ไขในหน้าแอดมิน ด้วยครับ

ได้เพิ่ม แท็บเมนูสำหรับ “ค้นหา / แก้ไขรายการ” เข้าไปในหน้าแอดมินให้อย่างครบถ้วนและสวยงาม เข้ากันกับดีไซน์โทนน่ารักเดิม (Cute Pink / Purple) เรียบร้อยแล้วครับ ✨

🌟 รายละเอียดสิ่งที่ปรับเพิ่มในระบบ
ระบบแท็บสลับโหมด (Tabs Navigation):

➕ บันทึกรายการใหม่: ฟอร์มบันทึกข้อมูลตามปกติ

✏️ ค้นหา / แก้ไขรายการเดิม: เปิดตารางดึงข้อมูลรายการที่เคยบันทึกไว้ใน Firebase Firestore ขึ้นมาแสดง พร้อมช่องค้นหาด้วยชื่อ-นามสกุล หรือ รหัสผู้เสียภาษี

ระบบดึงและแก้ไขข้อมูล (Update Doc):

เมื่อกดปุ่ม "✏️ แก้ไข" ในตาราง ระบบจะดึงข้อมูลรายการนั้นมาดึงลงฟอร์มให้อัตโนมัติ พร้อมแสดงกล่องแจ้งเตือนสถานะว่ากำลังอยู่ในโหมดแก้ไข

เปลี่ยนปุ่มบันทึกเป็น "💾 บันทึกการแก้ไขข้อมูล" (ทำการ updateDoc รายการเดิมแทนการสร้างรายการใหม่)

ระบบลบรายการ (Delete Doc):

มีปุ่ม "🗑️" สำหรับลบรายการที่ไม่ต้องการออกจาก Firebase Firestore

📁 ไฟล์โค้ดที่อัปเดตแล้ว
1. admin.html
ไอคอน HTML
admin
 HTML 
เปิดอยู่
2. app.js (รองรับทั้งการ addDoc, updateDoc, deleteDoc และ getDocs)
ไอคอน JS
app
 JS 
เปิดอยู่
โปรดทราบ
Gemini เป็น AI และอาจทำผิดพลาดได้ แชทจะได้รับการตรวจสอบและนำไปใช้เพื่อปรับปรุง AI ของ Google ดูข้อมูลเกี่ยวกับตัวเลือกของคุณ ข้อมูลเกี่ยวกับตำแหน่งของคุณจะจัดเก็บไว้ในกิจกรรมบนแอป Gemini ด้วยเช่นกัน การใช้งานต้องเป็นไปตามข้อกำหนดและประกาศเกี่ยวกับนโยบายความเป็นส่วนตัวของเรา



Gemini เป็น AI และอาจทำผิดพลาดได้

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔴 อย่าลืมวาง Firebase Config ของคุณตรงนี้
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let imageBase64 = "";
let currentEditId = null; // เก็บ ID เมื่ออยู่ในโหมดแก้ไข
let cachedRecords = []; // เก็บ Data สำหรับค้นหา

// ----------------------------------------------------
// Logic สำหรับหน้า admin.html
// ----------------------------------------------------
if (document.getElementById("taxForm")) {
  
  const tabAdd = document.getElementById("tabAdd");
  const tabEdit = document.getElementById("tabEdit");
  const searchSection = document.getElementById("searchSection");
  const editNotice = document.getElementById("editNotice");
  const editingDocId = document.getElementById("editingDocId");
  const btnCancelEdit = document.getElementById("btnCancelEdit");
  const btnSubmit = document.getElementById("btnSubmit");

  // สลับ Tab
  tabAdd.addEventListener("click", () => {
    tabAdd.className = "bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md transition active:scale-95";
    tabEdit.className = "bg-purple-100 hover:bg-purple-200 text-purple-700 px-6 py-2.5 rounded-2xl font-bold transition active:scale-95";
    searchSection.classList.add("hidden");
  });

  tabEdit.addEventListener("click", () => {
    tabEdit.className = "bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2.5 rounded-2xl font-bold shadow-md transition active:scale-95";
    tabAdd.className = "bg-pink-100 hover:bg-pink-200 text-pink-700 px-6 py-2.5 rounded-2xl font-bold transition active:scale-95";
    searchSection.classList.remove("hidden");
    loadEditList();
  });

  // ยกเลิกโหมดแก้ไข
  btnCancelEdit.addEventListener("click", resetFormToCreateMode);

  function resetFormToCreateMode() {
    currentEditId = null;
    document.getElementById("taxForm").reset();
    document.getElementById("imagePreview").classList.add("hidden");
    imageBase64 = "";
    editNotice.classList.add("hidden");
    btnSubmit.innerText = "💖 บันทึกข้อมูลเข้าระบบ";
    btnSubmit.className = "flex-1 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition";
  }

  // ดึง GPS
  document.getElementById("btnGps").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        document.getElementById("location").value = coords;
      }, () => alert("ไม่สามารถดึงพิกัด GPS ได้ค่ะ"));
    } else {
      alert("เบราว์เซอร์ไม่รองรับ GPS");
    }
  });

  // แปลงรูปถ่ายเป็น Base64
  document.getElementById("imageInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageBase64 = reader.result;
        const img = document.getElementById("imagePreview");
        img.src = imageBase64;
        img.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // บันทึก หรือ อัปเดตข้อมูล (Add / Update)
  document.getElementById("taxForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.innerText = "⏳ กำลังบันทึก...";

    try {
      const docData = {
        taxType: document.getElementById("taxType").value,
        docType: document.getElementById("docType").value,
        taxId: document.getElementById("taxId").value,
        fullName: document.getElementById("fullName").value,
        address: {
          houseNo: document.getElementById("houseNo").value,
          trok: document.getElementById("trok").value,
          soi: document.getElementById("soi").value,
          road: document.getElementById("road").value,
          district: document.getElementById("district").value,
          province: document.getElementById("province").value,
        },
        taxAmount: parseFloat(document.getElementById("taxAmount").value) || 0,
        location: document.getElementById("location").value,
        followResult: document.getElementById("followResult").value,
        otherDetail: document.getElementById("otherDetail").value,
        imageUrl: imageBase64,
        reporterName: document.getElementById("reporterName").value,
        reporterPosition: document.getElementById("reporterPosition").value,
        updatedAt: serverTimestamp()
      };

      if (currentEditId) {
        // อัปเดตรายการเดิม
        await updateDoc(doc(db, "tax_records", currentEditId), docData);
        alert("✨ อัปเดตข้อมูลเรียบร้อยแล้วค่ะ!");
        resetFormToCreateMode();
      } else {
        // เพิ่มรายการใหม่
        docData.createdAt = serverTimestamp();
        await addDoc(collection(db, "tax_records"), docData);
        alert("✨ บันทึกข้อมูลสำเร็จเรียบร้อยแล้วค่ะ!");
        resetFormToCreateMode();
      }

      if (!searchSection.classList.contains("hidden")) {
        loadEditList();
      }
    } catch (err) {
      console.error("Error saving document: ", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      btnSubmit.disabled = false;
    }
  });

  // โหลดรายการเพื่อแสดงในตารางแก้ไข
  async function loadEditList() {
    try {
      const q = query(collection(db, "tax_records"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      cachedRecords = [];

      querySnapshot.forEach((docSnap) => {
        cachedRecords.push({ id: docSnap.id, ...docSnap.data() });
      });

      renderEditTable(cachedRecords);
    } catch (err) {
      console.error("Error fetching list: ", err);
    }
  }

  // แสดงตารางแก้ไข
  function renderEditTable(records) {
    const tableBody = document.getElementById("editTableBody");
    tableBody.innerHTML = "";

    if (records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">ไม่พบรายการข้อมูล</td></tr>`;
      return;
    }

    records.forEach((item) => {
      const dateStr = item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString('th-TH') : '-';
      const tr = document.createElement("tr");
      tr.className = "hover:bg-purple-50/50 transition";
      tr.innerHTML = `
        <td class="p-3 text-xs">${dateStr}</td>
        <td class="p-3 font-bold">${item.fullName} <br><span class="text-xs font-normal text-slate-400">ID: ${item.taxId || '-'}</span></td>
        <td class="p-3 text-xs"><span class="px-2 py-1 bg-pink-100 text-pink-600 rounded-full font-bold">${item.taxType}</span></td>
        <td class="p-3 font-bold text-pink-500 text-xs">${(item.taxAmount || 0).toLocaleString()} ฿</td>
        <td class="p-3 text-center space-x-1">
          <button data-id="${item.id}" class="btnSelectEdit bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-xl text-xs font-bold transition shadow-sm">
            ✏️ แก้ไข
          </button>
          <button data-id="${item.id}" class="btnDelete bg-rose-400 hover:bg-rose-500 text-white px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-sm">
            🗑️
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // ผูก Event ปุ่มแก้ไข
    document.querySelectorAll(".btnSelectEdit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        const item = cachedRecords.find(r => r.id === id);
        if (item) populateFormForEdit(item);
      });
    });

    // ผูก Event ปุ่มลบ
    document.querySelectorAll(".btnDelete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
          await deleteDoc(doc(db, "tax_records", id));
          alert("ลบรายการเรียบร้อยแล้วค่ะ");
          loadEditList();
        }
      });
    });
  }

  // ค้นหาในตาราง
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = cachedRecords.filter(r => 
      (r.fullName && r.fullName.toLowerCase().includes(keyword)) ||
      (r.taxId && r.taxId.toLowerCase().includes(keyword))
    );
    renderEditTable(filtered);
  });

  // นำข้อมูลเข้าฟอร์มเมื่อกดเลือกแก้ไข
  function populateFormForEdit(item) {
    currentEditId = item.id;
    editingDocId.innerText = item.id;
    editNotice.classList.remove("hidden");

    document.getElementById("taxType").value = item.taxType || "";
    document.getElementById("docType").value = item.docType || "";
    document.getElementById("taxId").value = item.taxId || "";
    document.getElementById("fullName").value = item.fullName || "";
    document.getElementById("houseNo").value = item.address?.houseNo || "";
    document.getElementById("trok").value = item.address?.trok || "";
    document.getElementById("soi").value = item.address?.soi || "";
    document.getElementById("road").value = item.address?.road || "";
    document.getElementById("district").value = item.address?.district || "";
    document.getElementById("province").value = item.address?.province || "";
    document.getElementById("taxAmount").value = item.taxAmount || "";
    document.getElementById("location").value = item.location || "";
    document.getElementById("followResult").value = item.followResult || "";
    document.getElementById("otherDetail").value = item.otherDetail || "";
    document.getElementById("reporterName").value = item.reporterName || "";
    document.getElementById("reporterPosition").value = item.reporterPosition || "";

    if (item.imageUrl) {
      imageBase64 = item.imageUrl;
      const img = document.getElementById("imagePreview");
      img.src = imageBase64;
      img.classList.remove("hidden");
    }

    btnSubmit.innerText = "💾 บันทึกการแก้ไขข้อมูล";
    btnSubmit.className = "flex-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-amber-200 hover:opacity-90 active:scale-95 transition";

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // พิมพ์แบบราชการ
  document.getElementById("btnPrint").addEventListener("click", () => {
    document.getElementById("pTaxType").innerText = document.getElementById("taxType").value;
    document.getElementById("pFullName").innerText = document.getElementById("fullName").value;
    document.getElementById("pTaxId").innerText = document.getElementById("taxId").value || "-";
    document.getElementById("pDocType").innerText = document.getElementById("docType").value;
    document.getElementById("pAmount").innerText = document.getElementById("taxAmount").value || "0";
    document.getElementById("pResult").innerText = document.getElementById("followResult").value;
    document.getElementById("pOther").innerText = document.getElementById("otherDetail").value || "ไม่มี";
    document.getElementById("pReporter").innerText = document.getElementById("reporterName").value;
    document.getElementById("pPosition").innerText = document.getElementById("reporterPosition").value;
    
    const addr = `บ้านเลขที่ ${document.getElementById("houseNo").value} ตรอก/ซอย ${document.getElementById("soi").value} ถนน/ตำบล ${document.getElementById("road").value} อ.${document.getElementById("district").value} จ.${document.getElementById("province").value}`;
    document.getElementById("pAddress").innerText = addr;
    document.getElementById("pDate").innerText = `วันที่ ${new Date().toLocaleDateString('th-TH')}`;

    const printArea = document.getElementById("printArea");
    printArea.classList.remove("hidden");
    window.print();
    printArea.classList.add("hidden");
  });
}
app.js
กำลังแสดง app.js
