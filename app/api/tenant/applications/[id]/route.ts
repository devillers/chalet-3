import { notImplemented, requireSession } from '@/lib/api/response';

export async function PATCH() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Mise à jour de candidature locataire non implémentée.');
}

export async function DELETE() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Suppression ou retrait de candidature non implémenté.');
}
