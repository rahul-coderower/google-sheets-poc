type SheetContentCache = {
  [accessToken: string]: {
    spreadsheetId: string;
    sheetName: string;
    data: any[];
    lastUpdated: string;
  };
};

const sheetContentCache: SheetContentCache = {};

export const getCachedSheetContent = (accessToken: string) => {
  return sheetContentCache[accessToken] || [];
};

const fetchSheetContent = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
) => {
  const range = encodeURIComponent(`${sheetName}!A1:Z1000`);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    console.error('Failed to fetch spreadsheet content');
    return;
  }

  const data = await res.json();
  console.log('Fetched sheet content: ');
  console.dir(data, { depth: null });

  sheetContentCache[accessToken] = {
    spreadsheetId,
    sheetName,
    data,
    lastUpdated: new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    }),
  };
};

// periodic refresh per accessToken
setInterval(() => {
  Object.entries(sheetContentCache).forEach(
    ([accessToken, { spreadsheetId, sheetName }]) => {
      fetchSheetContent(accessToken, spreadsheetId, sheetName);
    }
  );
}, 60000);

// only fetch if not already cached
export const initSheetContentCache = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
) => {
  if (!sheetContentCache[accessToken]) {
    await fetchSheetContent(accessToken, spreadsheetId, sheetName);
  }
};
