export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');
  const sheetId = searchParams.get('sheetId');
  const range = searchParams.get('range') || 'Sheet1!A1:D10';

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
