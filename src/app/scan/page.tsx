'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/CameraCapture';

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<'capture' | 'ocr' | 'form' | 'done'>('capture');
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [assetNumber, setAssetNumber] = useState('');
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCapture = (capturedFile: File) => {
    setFile(capturedFile);
    doOCR(capturedFile);
  };

  const doOCR = async (imgFile: File) => {
    setStep('ocr');
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imgFile);

      const res = await fetch('/api/ocr', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setOcrText(data.fullText || '');
      setAssetNumber(data.assetNumber || '');
      setStep('form');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OCR failed');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requester.trim()) {
      setError('กรุณากรอกชื่อผู้แจ้ง');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      if (file) {
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
        const uploadData = await uploadRes.json();
        if (uploadData.error) throw new Error(uploadData.error);
        imageUrl = uploadData.url;
      }

      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_number: assetNumber,
          ocr_raw_text: ocrText,
          requester,
          department,
          description,
          image_url: imageUrl,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">บันทึกสำเร็จ!</h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          เลขเครื่อง: {assetNumber || '-'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => {
            setStep('capture'); setFile(null); setOcrText('');
            setAssetNumber(''); setRequester(''); setDepartment(''); setDescription('');
          }} className="px-6 py-3 rounded-lg font-medium"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
            แจ้งเพิ่ม
          </button>
          <button onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg font-medium"
            style={{ background: 'var(--accent)', color: '#000' }}>
            ดู Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">แจ้งซ่อม</h1>

      {step === 'capture' && (
        <div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            ถ่ายรูปเลขครุภัณฑ์ หรืออุปกรณ์ที่ต้องการแจ้ง
          </p>
          <CameraCapture onCapture={handleCapture} />
        </div>
      )}

      {step === 'ocr' && (
        <div className="text-center py-16">
          <div className="animate-spin inline-block w-10 h-10 border-4 rounded-full mb-4"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p>กำลังอ่านข้อมูลจากรูป...</p>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {ocrText && (
            <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--surface)' }}>
              <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--accent)' }}>
                OCR อ่านได้:
              </p>
              <p className="whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                {ocrText}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">เลขครุภัณฑ์</label>
            <input type="text" value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
              placeholder="เช่น IT-2024-00587" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ชื่อผู้แจ้ง *</label>
            <input type="text" value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="ชื่อ-นามสกุล" className="w-full" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ฝ่าย</label>
            <select value={department}
              onChange={(e) => setDepartment(e.target.value)} className="w-full">
              <option value="">-- เลือกฝ่าย --</option>
              <option value="IT">IT</option>
              <option value="บัญชี">บัญชี</option>
              <option value="ขาย">ขาย</option>
              <option value="การตลาด">การตลาด</option>
              <option value="ผลิต">ผลิต</option>
              <option value="บุคคล">บุคคล</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">อาการ / รายละเอียด</label>
            <textarea value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น เปิดไม่ติด, หน้าจอแตก, ลงโปรแกรม..."
              rows={3} className="w-full" />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('capture')}
              className="flex-1 py-3 rounded-lg font-medium"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
              ถ่ายใหม่
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-lg font-bold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#000' }}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
