type SpreadSheetCache = {
  [accessToken: string]: {
    data: any[];
    lastUpdated: string;
  };
};

const spreadSheetCache: SpreadSheetCache = {};

export const getCachedSpreadSheets = (accessToken: string) => {
  return spreadSheetCache[accessToken] || [];
};

const fetchSpreadSheets = async (accessToken: string) => {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    console.error('Failed to fetch list of spreadsheets');
    return;
  }

  const data = await res.json();
  console.log('Fetched Sheets: ');
  console.dir(data, { depth: null });

  spreadSheetCache[accessToken] = {
    data,
    lastUpdated: new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
    }),
  };
};

// periodic refresh per accessToken
setInterval(() => {
  Object.keys(spreadSheetCache).forEach((accessToken) => {
    fetchSpreadSheets(accessToken);
  });
}, 60000);

// only fetch if not already cached
export const initSpreadsheetCache = async (accesToken: string) => {
  if (!spreadSheetCache[accesToken]) {
    await fetchSpreadSheets(accesToken);
  }
};
