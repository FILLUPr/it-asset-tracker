import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
            },
          ],
        }),
      }
    );

    const visionData = await visionRes.json();
    const fullText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';

    const patterns = [
      /[A-Za-z]{2,}[-–]\d{4}[-–]\d{3,6}/g,
      /\b[A-Z]{2,}[-]?\d{4,}\b/g,
      /\b\d{5,}\b/g,
    ];

    let assetNumber = '';
    for (const pattern of patterns) {
      const match = fullText.match(pattern);
      if (match) {
        assetNumber = match[0];
        break;
      }
    }

    return NextResponse.json({ fullText: fullText.trim(), assetNumber });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 });
  }
}
