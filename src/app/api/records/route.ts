import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY!;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  const search = req.nextUrl.searchParams.get('search');

  let url = `${SUPABASE_URL}/rest/v1/records?select=*&order=created_at.desc`;

  if (status && status !== 'all') {
    url += `&status=eq.${status}`;
  }
  if (search) {
    url += `&or=(asset_number.ilike.*${search}*,requester.ilike.*${search}*,department.ilike.*${search}*)`;
  }

  const res = await fetch(url, { headers });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      asset_number: body.asset_number || null,
      ocr_raw_text: body.ocr_raw_text || null,
      requester: body.requester,
      department: body.department || null,
      description: body.description || null,
      image_url: body.image_url || null,
      status: 'pending',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/records?id=eq.${body.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: body.status,
      updated_at: new Date().toISOString(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 });
  }

  return NextResponse.json(data);
}
