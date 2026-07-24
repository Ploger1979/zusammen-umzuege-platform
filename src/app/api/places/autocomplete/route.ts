import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');

    if (!input) {
        return NextResponse.json({ success: false, error: 'Input is required' }, { status: 400 });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ success: false, error: 'Google Maps API Key not configured' }, { status: 500 });
    }

    try {
        // Restrict to Germany (components=country:de) and language German
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:de&language=de&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK') {
            return NextResponse.json({ success: true, predictions: data.predictions });
        } else {
            return NextResponse.json({ success: false, error: data.error_message || data.status }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Google Places Autocomplete Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
