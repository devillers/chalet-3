import { notImplemented, requireSession } from '@/lib/api/response';

export async function PATCH() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Réordonnancement des images non implémenté.');
}
