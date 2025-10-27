import { notImplemented, requireSession } from '@/lib/api/response';

export async function PUT() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour de source iCal non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression de source iCal non implémentée.');
}
