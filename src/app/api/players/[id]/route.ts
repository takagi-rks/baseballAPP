import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name, uniform_number, position, batting_order, is_active } = await request.json();
    
    const query = `
      UPDATE players
      SET name = $1, uniform_number = $2, position = $3, batting_order = $4, is_active = $5
      WHERE id = $6;
    `;
    await pool.query(query, [
      name, 
      parseInt(uniform_number || 0), 
      position, 
      parseInt(batting_order || 0), 
      is_active === undefined ? true : is_active, 
      id
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Player Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // 論理削除
    await pool.query('UPDATE players SET is_active = false WHERE id = $1;', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Deactivate Player Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
