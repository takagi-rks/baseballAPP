import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM players WHERE is_active = true ORDER BY batting_order ASC;');
    return NextResponse.json({ success: true, players: result.rows });
  } catch (error: any) {
    console.error("Fetch Players Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, uniform_number, position, batting_order } = await request.json();
    const query = `
      INSERT INTO players (name, uniform_number, position, batting_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      name, 
      parseInt(uniform_number || 0), 
      position || "", 
      parseInt(batting_order || 0)
    ]);
    return NextResponse.json({ success: true, player: result.rows[0] });
  } catch (error: any) {
    console.error("Create Player Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
