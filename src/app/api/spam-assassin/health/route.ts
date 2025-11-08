
import { NextResponse } from 'next/server';

export async function GET() {
  const API_BASE = "https://gdvsjd6vdkw749874bkd83.fanton.cloud:8081";
  const url = `${API_BASE}/health`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`SpamAssassin Health API Error: ${response.status}`, errorBody);
      return NextResponse.json({ error: `Error con la API de SpamAssassin: ${response.statusText}. Cuerpo: ${errorBody}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('SpamAssassin Health API call failed:', error);
    return NextResponse.json({ error: `No se pudo conectar con la API de SpamAssassin: ${error.message}` }, { status: 500 });
  }
}
