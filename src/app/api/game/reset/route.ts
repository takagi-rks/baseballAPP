import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function DELETE() {
  try {
    // 今回はプロトタイプのため、全打席データを削除
    const query = 'DELETE FROM plate_appearances;';
    await pool.query(query);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Game Reset Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
