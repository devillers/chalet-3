import { requireSession } from '@/lib/api/response';

export async function GET() {
  const { response } = await requireSession(['SUPERADMIN']);
  if (response) {
    return response;
  }
  return new Response('id,title,status\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
