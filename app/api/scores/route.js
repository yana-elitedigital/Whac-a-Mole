import { NextResponse } from 'next/server';
import { getScoreCollection } from '@/lib/mongodb';

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const {
    playerName = 'Anonymous',
    score,
    combo = 0,
    durationSeconds = 60,
    occurredAt = new Date().toISOString()
  } = payload;

  if (typeof score !== 'number' || Number.isNaN(score)) {
    return NextResponse.json(
      { success: false, message: 'Score must be a numeric value.' },
      { status: 422 }
    );
  }

  const name = typeof playerName === 'string' && playerName.trim() ? playerName.trim().slice(0, 32) : 'Anonymous';

  try {
    const collection = await getScoreCollection();
    const doc = {
      playerName: name,
      score,
      combo,
      durationSeconds,
      occurredAt: new Date(occurredAt)
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        score: doc
      },
      { status: 201 }
    );
  } catch (error) {
    const status = error.message.includes('MONGODB_URI') ? 503 : 500;
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to persist score yet. Configure MongoDB and try again.',
        detail: error.message
      },
      { status }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Score persistence endpoint ready. Connect MongoDB to enable leaderboard queries.'
  });
}
