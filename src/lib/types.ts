export interface RepairRecord {
  id: string;
  asset_number: string | null;
  ocr_raw_text: string | null;
  requester: string;
  department: string | null;
  description: string | null;
  image_url: string | null;
  status: 'pending' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}
