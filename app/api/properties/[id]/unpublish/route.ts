import { notImplemented, requireSession } from '@/lib/api/response';

export async function POST() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Dépublication de propriété non implémentée.');
}
