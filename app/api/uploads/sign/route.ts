import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { requireSession } from '@/lib/api/response';
import { env } from '@/env';

interface SignaturePayload {
  folder: string;
  timestamp: number;
  public_id?: string;
}

export async function POST(request: Request) {
  const { response, session } = await requireSession();
  if (response || !session) {
    return response ?? NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<{ folder: string; publicId: string }>;
  const baseFolder = (env.CLOUDINARY_ONBOARDING_FOLDER ?? '').replace(/\/+$/, '');
  const folderFromBody =
    typeof body.folder === 'string' ? body.folder.trim().replace(/\/+$/, '') : '';
  const folder = [folderFromBody || baseFolder, session.user.id].filter(Boolean).join('/');
  const timestamp = Math.floor(Date.now() / 1000);

  const payload: SignaturePayload = {
    folder,
    timestamp,
  };

  if (typeof body.publicId === 'string' && body.publicId.trim().length > 0) {
    payload.public_id = body.publicId.trim();
  }

  const signature = signCloudinaryPayload(payload);

  return NextResponse.json({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    signature,
    timestamp,
    folder,
    maxFileSize: 10 * 1024 * 1024,
  });
}

function signCloudinaryPayload(params: SignaturePayload): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && `${value}`.length > 0)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  const toSign = entries.map(([key, value]) => `${key}=${value}`).join('&');
  return createHash('sha1').update(`${toSign}${env.CLOUDINARY_API_SECRET}`).digest('hex');
}
