import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['OWNER', 'SUPERADMIN']);
  if (response) {
    return response;
  }
  return notImplemented('Lecture des sources iCal non implémentée.');
}

export async function POST() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Création de source iCal non implémentée.');
}
