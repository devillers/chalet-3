import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '12');
  return NextResponse.json({
    filters: Object.fromEntries(url.searchParams.entries()),
    pagination: { page, pageSize },
    items: [],
  });
}
