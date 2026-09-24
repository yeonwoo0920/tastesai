import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ authenticated: false, state: null });
  try {
    const row = await env.DB.prepare("SELECT payload FROM user_state WHERE user_id = ?").bind(user.userId).first<{ payload: string }>();
    return Response.json({ authenticated: true, state: row ? JSON.parse(row.payload) : null });
  } catch (error) {
    console.error("state load failed", error);
    return Response.json({ error: "저장된 정보를 불러오지 못했어요." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  try {
    const state = await request.json();
    const payload = JSON.stringify(state);
    if (payload.length > 150_000) return Response.json({ error: "저장할 내용이 너무 커요." }, { status: 413 });
    await env.DB.prepare("INSERT INTO user_state (user_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at").bind(user.userId, payload, Date.now()).run();
    return Response.json({ saved: true });
  } catch (error) {
    console.error("state save failed", error);
    return Response.json({ error: "변경 사항을 저장하지 못했어요." }, { status: 503 });
  }
}
