import { notImplemented, requireSession } from '@/lib/api/response';

export async function PUT() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour des préférences locataire non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression des préférences locataire non implémentée.');
}
