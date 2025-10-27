import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/api/response';
import { env } from '@/env';

export async function POST() {
  const { response } = await requireSession();
  if (response) {
    return response;
  }
  return NextResponse.json({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    signature: 'mock-signature',
    timestamp: Date.now(),
  });
}
