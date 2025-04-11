'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from 'next/image';

interface SheetFile {
  id: string;
  name: string;
  mimeType: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [sheets, setSheets] = useState<SheetFile[]>([]);
  const [tabs, setTabs] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingSheetData, setLoadingSheetData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSheets = async () => {
    if (!session?.accessToken) return;
    setLoadingSheets(true);
    setError(null);
    try {
      const res = await fetch(`/api/google/list-sheets?accessToken=${session.accessToken}`);
      const data = await res.json();
      setSheets(data.files || []);
    } catch (err) {
      setError("Failed to load sheets.");
    } finally {
      setLoadingSheets(false);
    }
  };

  const fetchTabs = async (sheetId: string) => {
    setSelectedSpreadsheetId(sheetId);
    setSelectedTab(null);
    setSheetData([]);
    const res = await fetch(`/api/google/list-tabs?accessToken=${session?.accessToken}&spreadsheetId=${sheetId}`);
    const data = await res.json();
    const tabTitles = data?.sheets?.map((s: any) => s.properties.title) || [];
    setTabs(tabTitles);
  };

  const fetchSheetContent = async (spreadsheetId: string, tabName: string) => {
    if (!session?.accessToken) return;
    setLoadingSheetData(true);
    setSelectedTab(tabName);
    setError(null);
    try {
      const res = await fetch(`/api/google/read-sheet?accessToken=${session.accessToken}&spreadsheetId=${spreadsheetId}&sheetName=${encodeURIComponent(tabName)}`);
      const data = await res.json();
      setSheetData(data.values || []);
    } catch (err) {
      setError("Failed to load sheet data.");
    } finally {
      setLoadingSheetData(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken && sheets.length === 0) {
      fetchSheets();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Sign in to continue</h1>
          <button
            onClick={() => signIn('google')}
            className="flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition w-full"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome, {session.user?.name}
            </h2>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            Sign Out
          </button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Google Sheets</h3>
          {loadingSheets ? (
            <p className="text-gray-500">Loading sheets...</p>
          ) : (
            <ul className="space-y-2">
              {sheets.map((sheet) => (
                <li key={sheet.id}>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => fetchTabs(sheet.id)}
                  >
                    {sheet.name}
                  </button>
                </li>
              ))}
              {sheets.length === 0 && <p className="text-sm text-gray-500">No sheets found.</p>}
            </ul>
          )}
        </div>

        {tabs.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Sheets in spreadsheet:</h4>
            <ul className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <li key={tab}>
                  <button
                    className={`px-3 py-1 rounded-md border ${selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => fetchSheetContent(selectedSpreadsheetId!, tab)}
                  >
                    {tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loadingSheetData && <p className="text-gray-500">Loading sheet data...</p>}

        {!loadingSheetData && sheetData.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Data in "{selectedTab}"</h4>
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm text-left border-collapse">
                <tbody>
                  {sheetData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 border text-gray-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
