export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');
  const spreadsheetId = searchParams.get('spreadsheetId'); // fixed name
  const sheetName = searchParams.get('sheetName'); // read sheetName instead of range

  if (!accessToken || !spreadsheetId || !sheetName) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400 }
    );
  }

  // Properly encode range like "Sheet 2!A1:Z1000"
  const range = encodeURIComponent(`${sheetName}!A1:Z1000`);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
