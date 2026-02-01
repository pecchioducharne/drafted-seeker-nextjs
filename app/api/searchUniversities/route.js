import { NextResponse } from 'next/server';

const FALLBACK_UNIVERSITIES = [
  { id: 'harvard', school: { name: 'Harvard University' } },
  { id: 'stanford', school: { name: 'Stanford University' } },
  { id: 'mit', school: { name: 'Massachusetts Institute of Technology' } },
  { id: 'ucla', school: { name: 'University of California, Los Angeles' } },
  { id: 'berkeley', school: { name: 'University of California, Berkeley' } },
];

function buildFallback(query) {
  const base = [
    { id: query, school: { name: `${query} (Add as custom university)` } },
    { id: 'other', school: { name: 'Other University (please specify)' } },
    ...FALLBACK_UNIVERSITIES,
  ];
  return base.filter((uni) =>
    uni.school.name.toLowerCase().includes(query.toLowerCase())
  );
}

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const apiKey = process.env.COLLEGE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        results: [
          { id: query, school: { name: `${query} (Add as custom university)` } },
          { id: 'other', school: { name: 'Other University (please specify)' } },
        ],
      });
    }

    const response = await fetch(
      `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${encodeURIComponent(query)}&api_key=${apiKey}`
    );

    if (!response.ok) {
      return NextResponse.json({ results: buildFallback(query) });
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        results: [
          { id: query, school: { name: `${query} (Add as custom university)` } },
          { id: 'other', school: { name: 'Other University (please specify)' } },
        ],
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('University search error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
