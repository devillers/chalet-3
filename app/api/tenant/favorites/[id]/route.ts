import { notImplemented, requireSession } from '@/lib/api/response';

export async function DELETE() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Retrait des favoris non implémenté.');
}
