import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');
    
    if (!gameId) {
      return NextResponse.json({ success: false, error: "game_id required" }, { status: 400 });
    }

    const query = `
      SELECT * FROM plate_appearances 
      WHERE game_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10;
    `;
    const result = await pool.query(query, [gameId]);
    return NextResponse.json({ success: true, history: result.rows });
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
