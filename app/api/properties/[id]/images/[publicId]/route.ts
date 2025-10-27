import { notImplemented, requireSession } from '@/lib/api/response';

export async function DELETE() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression d\'image non implémentée.');
}
