const ICS_TEMPLATE = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Chalet Manager//Calendar 1.0//FR\nEND:VCALENDAR`;

export async function GET() {
  return new Response(ICS_TEMPLATE, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
