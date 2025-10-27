import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Tableau des propriétés SuperAdmin non implémenté.');
}
