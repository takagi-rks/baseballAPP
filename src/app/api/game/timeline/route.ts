import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: false, error: "game_id required" }, { status: 400 });
    }

    const query = `
      SELECT 
        pa.id,
        pa.inning,
        pa.result_category,
        pa.result_detail,
        pa.rbi,
        pa.runs,
        pa.created_at,
        p.name as player_name,
        p.uniform_number
      FROM plate_appearances pa
      LEFT JOIN players p ON pa.player_id = p.id
      WHERE pa.game_id = $1
      ORDER BY pa.inning DESC, pa.created_at DESC;
    `;
    const result = await pool.query(query, [gameId]);

    // Group events by inning
    const groups: { inning: number; events: any[] }[] = [];
    for (const row of result.rows) {
      let group = groups.find(g => g.inning === row.inning);
      if (!group) {
        group = { inning: row.inning, events: [] };
        groups.push(group);
      }
      group.events.push({
        id: row.id,
        result_category: row.result_category,
        result_detail: row.result_detail,
        rbi: row.rbi,
        runs: row.runs,
        created_at: row.created_at,
        player_name: row.player_name || '不明',
        uniform_number: row.uniform_number
      });
    }

    return NextResponse.json({ success: true, timeline: groups });
  } catch (error: any) {
    console.error("Timeline Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
