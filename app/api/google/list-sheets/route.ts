import {
  getCachedSpreadSheets,
  initSpreadsheetCache,
} from '@/utils/spreadsheetsCache';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');

  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200 });

  // if (!accessToken) {
  //   return Response.json({ message: 'Missing access token' }, { status: 400 });
  // }
  // await initSpreadsheetCache(accessToken);
  // const response = getCachedSpreadSheets(accessToken);
  // return new Response(JSON.stringify(response.data), { status: 200 });
}
