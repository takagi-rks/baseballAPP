import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function initTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      uniform_number INT,
      position VARCHAR(50),
      batting_order INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

export async function GET() {
  try {
    await initTable();
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
