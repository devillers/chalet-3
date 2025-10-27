import { notImplemented, requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Lecture des préférences locataire non implémentée.');
}

export async function POST() {
  const { response } = await requireSession(['TENANT']);
  if (response) {
    return response;
  }
  return notImplemented('Création de préférence locataire non implémentée.');
}
