export default function Home() {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
        IT Asset Tracker
      </h1>
      <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>
        ระบบแจ้งซ่อม / บันทึกอุปกรณ์ พร้อม OCR อ่านเลขเครื่องอัตโนมัติ
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a href="/scan" className="block p-8 rounded-xl border transition-all hover:scale-[1.02]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-xl font-bold mb-2">แจ้งซ่อม</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            ถ่ายรูปเลขเครื่อง → OCR อ่านอัตโนมัติ → กรอกข้อมูล → ส่งแจ้ง
          </p>
        </a>
        <a href="/dashboard" className="block p-8 rounded-xl border transition-all hover:scale-[1.02]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            ดูรายการทั้งหมด / ค้นหา / อัปเดตสถานะ / ดูย้อนหลัง
          </p>
        </a>
      </div>
    </div>
  );
}
