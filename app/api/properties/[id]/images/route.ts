import { notImplemented, requireSession } from '@/lib/api/response';

export async function POST() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Ajout de photo non implémenté.');
}
