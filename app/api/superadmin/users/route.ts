import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Liste des utilisateurs non implémentée.');
}

export async function POST() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Création d\'utilisateur SuperAdmin non implémentée.');
}
