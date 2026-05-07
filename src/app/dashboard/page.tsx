'use client';

import { useEffect, useState, useCallback } from 'react';

interface RepairRecord {
  id: string;
  asset_number: string | null;
  ocr_raw_text: string | null;
  requester: string;
  department: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'รอดำเนินการ', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    in_progress: { label: 'กำลังซ่อม', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    done: { label: 'เสร็จแล้ว', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  };
  const s = statusMap[status] || statusMap.pending;
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

export default function DashboardPage() {
  const [records, setRecords] = useState<RepairRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/records?${params}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/records', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchRecords();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const stats = {
    total: records.length,
    pending: records.filter((r) => r.status === 'pending').length,
    in_progress: records.filter((r) => r.status === 'in_progress').length,
    done: records.filter((r) => r.status === 'done').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'var(--text-primary)' },
          { label: 'รอดำเนินการ', value: stats.pending, color: 'var(--warning)' },
          { label: 'กำลังซ่อม', value: stats.in_progress, color: '#3b82f6' },
          { label: 'เสร็จแล้ว', value: stats.done, color: 'var(--success)' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-lg border text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" placeholder="ค้นหา เลขเครื่อง / ชื่อ / ฝ่าย..."
          value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-48">
          <option value="all">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="in_progress">กำลังซ่อม</option>
          <option value="done">เสร็จแล้ว</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>กำลังโหลด...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>ยังไม่มีรายการ</div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="p-4 rounded-lg border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-bold text-lg">{record.asset_number || '-'}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {record.requester}{record.department && ` · ${record.department}`}
                  </p>
                </div>
                <StatusBadge status={record.status} />
              </div>
              {record.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{record.description}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(record.created_at)}</p>
                <div className="flex gap-2">
                  {record.image_url && (
                    <a href={record.image_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>ดูรูป</a>
                  )}
                  {record.status === 'pending' && (
                    <button onClick={() => updateStatus(record.id, 'in_progress')}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>รับงาน</button>
                  )}
                  {record.status === 'in_progress' && (
                    <button onClick={() => updateStatus(record.id, 'done')}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>เสร็จแล้ว</button>
                  )}
                  {record.status === 'done' && (
                    <button onClick={() => updateStatus(record.id, 'pending')}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>เปิดใหม่</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
