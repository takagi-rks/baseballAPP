import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// 環境変数からPostgreSQLへの接続情報を取得してプールを作成
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      game_id,
      player_id,
      inning,
      result_category,
      result_detail,
      rbi,
      runs,
      stolen_bases,
      slugging_value
    } = body;

    // TODO: 実際のアプリではログイン中のユーザーや選択中のチームなどから動的に取得します
    const team_id = 1;
    
    // 集計用のフラグをカテゴリから自動判定
    // 安打かどうか
    const isHit = result_category === 'HIT';
    
    // 打数にカウントするか（四球、死球、犠飛、犠打 は打数に含めない）
    const isAtBat = !['WALK', 'SACRIFICE'].includes(result_category) && result_detail !== 'HIT_BY_PITCH';

    const query = `
      INSERT INTO plate_appearances (
        team_id, game_id, player_id, inning, 
        result_category, result_detail, rbi, runs, stolen_bases, 
        is_at_bat, is_hit, slugging_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `;
    
    const values = [
      team_id, game_id, player_id, inning,
      result_category, result_detail, rbi, runs, stolen_bases,
      isAtBat, isHit, slugging_value
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error: any) {
    console.error("DB Insert Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
