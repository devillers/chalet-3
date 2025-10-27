import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  return notImplemented('Lecture de propriété non implémentée.');
}

export async function PUT() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour de propriété non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression (soft/hard) de propriété non implémentée.');
}
