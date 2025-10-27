import { requireSession, notImplemented } from '@/lib/api/response';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mine = url.searchParams.get('mine');
  if (mine === '1') {
    const { response } = await requireSession(['OWNER', 'TENANT']);
    if (response) {
      return response;
    }
  }
  return notImplemented('Listing des propriétés non implémenté.');
}

export async function POST() {
  const { response } = await requireSession(['OWNER']);
  if (response) {
    return response;
  }
  return notImplemented('Création de brouillon de propriété non implémentée.');
}
