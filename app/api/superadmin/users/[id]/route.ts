import { notImplemented, requireSession } from '@/lib/api/response';

export async function PATCH() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour utilisateur non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression d\'utilisateur non implémentée.');
}
