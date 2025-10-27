import { notImplemented, requireSession } from '@/lib/api/response';

export async function POST() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Restauration de propriété non implémentée.');
}
