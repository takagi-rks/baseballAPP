import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

const INNINGS = [1, 2, 3, 4, 5, 6, 7];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'game_id required' },
        { status: 400 }
      );
    }

    // 変更理由: us/them 両方を inning_scores から取得
    const query = `
      SELECT inning, team_side, runs
      FROM inning_scores
      WHERE game_id = $1
      ORDER BY inning ASC;
    `;
    const result = await pool.query(query, [gameId]);

    const usMap = new Map<number, number>();
    const themMap = new Map<number, number>();

    for (const row of result.rows) {
      if (row.team_side === 'us') usMap.set(row.inning, row.runs);
      if (row.team_side === 'them') themMap.set(row.inning, row.runs);
    }

    // 変更理由: 1〜7回を必ず補完して返す
    const us = INNINGS.map(i => ({ inning: i, runs: usMap.get(i) ?? 0 }));
    const them = INNINGS.map(i => ({ inning: i, runs: themMap.get(i) ?? 0 }));

    return NextResponse.json({ success: true, scores: { us, them } });

  } catch (error) {
    console.error('Fetch Scoreboard Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scoreboard' },
      { status: 500 }
    );
  }
}
