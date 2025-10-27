import { notImplemented, requireSession } from '@/lib/api/response';

export async function POST() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Actions bulk propriétés non implémentées.');
}
