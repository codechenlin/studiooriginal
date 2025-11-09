
import { NextResponse } from 'next/server';
import https from 'https';

const API_BASE = "https://gdvsjd6vdkw749874bkd83.fanton.cloud:8180";
const API_KEY = "75bf75bnrfnuif0857nbf74fe521zdx";

// Create a single, reusable agent that ignores self-signed certificates.
// This is the key to solving the "fetch failed" error in a server environment.
const agent = new https.Agent({
  rejectUnauthorized: false,
});


export async function GET() {
  const url = `${API_BASE}/health`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY,
      },
      // @ts-ignore - This is a valid option for node-fetch which is used by Next.js server-side
      agent,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = `${API_BASE}/classify/json`;
    
    // The payload for the external API remains the same
    const apiPayload = {
        raw_mime: `From: ${body.from}\nTo: ${body.to}\nSubject: ${body.subject}\n\n${body.body}`,
        sensitivity: body.sensitivity,
        return_details: true,
        clamav_scan: body.clamav_scan || false
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
      },
      body: JSON.stringify(apiPayload),
      // @ts-ignore - Use the same agent for POST requests
      agent,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`SpamAssassin Classify API Error: ${response.status}`, errorBody);
      return NextResponse.json({ error: `Error con la API de SpamAssassin: ${response.statusText}. Cuerpo: ${errorBody}` }, { status: response.status });
    }

    const result = await response.json();
    // The external API seems to return isSpam, but the old code expected is_spam. Let's align.
    // We will transform the response to match the schema expected by the frontend.
    const transformedResult = {
        is_spam: result.isSpam,
        score: result.score,
        threshold: result.thresholdApplied,
        report: JSON.stringify(result.details, null, 2), // The report is an object, stringify for display
    };

    return NextResponse.json(transformedResult);

  } catch (error: any) {
    console.error('SpamAssassin Classify API call failed:', error);
    return NextResponse.json({ error: `No se pudo conectar con la API de SpamAssassin