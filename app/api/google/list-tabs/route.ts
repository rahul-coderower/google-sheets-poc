export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');
  const spreadsheetId = searchParams.get('spreadsheetId');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
