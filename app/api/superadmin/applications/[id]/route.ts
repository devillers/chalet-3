import { notImplemented, requireSession } from '@/lib/api/response';

export async function PATCH() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Action SuperAdmin sur candidature non implémentée.');
}
