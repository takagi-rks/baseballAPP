import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        pa.player_id,
        p.name,
        p.uniform_number,
        COUNT(*)::int AS plate_appearances,
        SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END)::int AS at_bats,
        SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END)::int AS hits
      FROM plate_appearances pa
      JOIN players p ON pa.player_id = p.id
      GROUP BY pa.player_id, p.name, p.uniform_number
      ORDER BY p.uniform_number ASC;
    `);

    return NextResponse.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    console.error('Career Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career stats' },
      { status: 500 }
    );
  }
}
