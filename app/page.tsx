'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface SheetFile {
  id: string;
  name: string;
  mimeType: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [sheets, setSheets] = useState<SheetFile[]>([]);
  const [sheetData, setSheetData] = useState<string[][]>([]);

  const fetchSheets = async () => {
    const res = await fetch(`/api/google/list-sheets?accessToken=${session?.accessToken}`);
    const data = await res.json();
    setSheets(data.files || []);
  };

  const fetchSheetContent = async (sheetId: string) => {
    const res = await fetch(`/api/google/read-sheet?accessToken=${session?.accessToken}&sheetId=${sheetId}`);
    const data = await res.json();
    setSheetData(data.values || []);
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchSheets();
    }
  }, [session]);

  if (!session) return <button onClick={() => signIn("google")}>Sign in with Google</button>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl">Welcome, {session.user?.name}</h2>
        <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-1 rounded">Sign out</button>
      </div>

      <h3 className="text-lg font-semibold">Your Google Sheets</h3>
      <ul className="list-disc ml-5">
        {sheets.map(sheet => (
          <li key={sheet.id}>
            <button className="text-blue-600 underline" onClick={() => fetchSheetContent(sheet.id)}>
              {sheet.name}
            </button>
          </li>
        ))}
      </ul>

      {sheetData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">Sheet Data:</h4>
          <table className="border w-full text-left">
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border px-2 py-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
