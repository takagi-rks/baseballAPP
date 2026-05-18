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

    const playersResult = await pool.query('SELECT id, name FROM players WHERE is_active = true;');
    const players = playersResult.rows;

    const statsQuery = `
      SELECT
          player_id,
          COUNT(*)::int as pa,
          SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END)::int as ab,
          SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::int as h,
          SUM(rbi)::int as rbi,
          SUM(runs)::int as runs,
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0 
               THEN ROUND(SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as avg,
          CASE WHEN COUNT(*) > 0
               THEN ROUND((SUM(CASE WHEN is_hit THEN 1 ELSE 0 END) + SUM(CASE WHEN result_category = 'WALK' THEN 1 ELSE 0 END))::numeric / COUNT(*), 3)
               ELSE 0 END as obp,
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0
               THEN ROUND(SUM(slugging_value)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as slg
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY player_id;
    `;
    const statsResult = await pool.query(statsQuery, [gameId]);
    const statsMap = new Map(statsResult.rows.map(s => [s.player_id, s]));

    const comments = players.map(p => {
      const stat = statsMap.get(p.id);
      let comment = "まだデータがありません";
      let mood: 'neutral' | 'good' | 'great' = 'neutral';

      if (stat && stat.pa > 0) {
        const avg = parseFloat(stat.avg);
        const ops = parseFloat(stat.obp) + parseFloat(stat.slg);

        if (ops >= 1.2) {
          comment = "驚異的な破壊力です。手が付けられない状態ですね！";
          mood = 'great';
        } else if (ops >= 1.0) {
          comment = "今日は長打力と出塁力の両面で素晴らしい内容です。";
          mood = 'great';
        } else if (avg >= 0.5) {
          comment = "高い確率でヒットを打てており、打線の中心になっています。";
          mood = 'good';
        } else if (stat.rbi >= 2) {
          comment = "チャンスで結果を出せています。勝負強さが光ります。";
          mood = 'good';
        } else if (stat.h >= 2) {
          comment = "マルチ安打達成！バットがよく振れています。";
          mood = 'good';
        } else if (stat.h >= 1) {
          comment = "一本出ているので、次の打席も期待できます。";
          mood = 'neutral';
        } else if (stat.pa >= 3) {
          comment = "結果は出ていませんが、内容は悪くありません。辛抱強く行きましょう。";
          mood = 'neutral';
        } else {
          comment = "まだ当たりが出ていませんが、徐々にタイミングは合ってきています。";
          mood = 'neutral';
        }
      }

      return {
        player_id: p.id,
        name: p.name,
        comment,
        mood
      };
    });

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    console.error("AI Comments Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
