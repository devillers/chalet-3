import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['TENANT', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Lecture profil locataire non implémentée.');
}

export async function PUT() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour profil locataire non implémentée.');
}
