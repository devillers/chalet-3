import { notImplemented, requireSession } from '@/lib/api/response';

export async function POST() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Action propriétaire sur candidature non implémentée.');
}
