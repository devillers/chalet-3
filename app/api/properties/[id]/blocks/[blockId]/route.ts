import { notImplemented, requireSession } from '@/lib/api/response';

export async function PUT() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour de bloc calendrier non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression de bloc calendrier non implémentée.');
}
