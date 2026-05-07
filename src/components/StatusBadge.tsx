interface Props {
  status: string;
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'รอดำเนินการ', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  in_progress: { label: 'กำลังซ่อม', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  done: { label: 'เสร็จแล้ว', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
};

export default function StatusBadge({ status }: Props) {
  const s = statusMap[status] || statusMap.pending;
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}
